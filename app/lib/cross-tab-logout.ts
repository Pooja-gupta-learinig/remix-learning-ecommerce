/**
 * Cross-tab logout utility
 * 
 * This module handles logout synchronization across all open tabs/windows.
 * When a user logs out in one tab, all other tabs are automatically redirected to login.
 */

const LOGOUT_EVENT_KEY = "app_logout_event";

/**
 * Triggers a logout event that will be detected by all open tabs/windows
 */
export function triggerLogoutEvent(): void {
	if (typeof window === "undefined") return;
	console.log("add - triggerLogoutEvent");
	// Set a timestamp in localStorage to trigger the storage event
	// This will be detected by all other tabs/windows
	localStorage.setItem(LOGOUT_EVENT_KEY, Date.now().toString());
	
	// Remove the item immediately to allow future logout events
	// The storage event will still fire for other tabs
	setTimeout(() => {
		console.log("remove - triggerLogoutEvent");
		localStorage.removeItem(LOGOUT_EVENT_KEY);
	}, 100);
}

/**
 * Sets up a listener for logout events from other tabs/windows
 * When detected, destroys the session and redirects to the login page
 * 
 * @param redirectTo - The URL to redirect to on logout (default: "/login")
 */
export function setupLogoutListener(redirectTo = "/login"): () => void {
	if (typeof window === "undefined") {
		return () => {}; // Return no-op cleanup function for SSR
	}
	async function handleStorageEvent(event: StorageEvent): Promise<void> {
		// Check if this is a logout event from another tab
		if (event.key === LOGOUT_EVENT_KEY && event.newValue) {
			try {
				// Destroy the session on the server by calling the logout endpoint
				// This ensures the session cookie is cleared for this tab as well
				await fetch("/logout", {
					method: "POST",
					credentials: "include", // Include cookies in the request
				});
			} catch (error) {
				// If the fetch fails, still redirect to ensure user is logged out
				console.error("Failed to destroy session on logout event:", error);
			}
			// Redirect to login page
			window.location.href = redirectTo;
		}
	}

	// Listen for storage events (fired when localStorage changes in other tabs)
	window.addEventListener("storage", handleStorageEvent);
	// Return cleanup function
	return () => {
		window.removeEventListener("storage", handleStorageEvent);
	};
}

