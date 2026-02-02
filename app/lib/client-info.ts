/**
 * @file Client information data fetching utilities
 */

export type ClientInfo = {
	ip: string;
	userAgent?: string;
};

/**
 * Fetches client IP and user agent information
 * @returns Promise resolving to client info with IP and optional user agent
 * @throws Response error if fetch fails or data is invalid
 */
export async function getClientInfo(): Promise<ClientInfo> {
	const res = await fetch(`https://dummyjson.com/ip`);
	
	if (!res.ok) {
		throw new Response("Failed to fetch client info", {
			status: res.status,
			statusText: res.statusText,
		});
	}

	const data = await res.json();

	if (!data || !data.ip) {
		throw new Response("Invalid client info data", {
			status: 500,
			statusText: "Invalid response",
		});
	}

	// Get userAgent from browser if available
	const userAgent = typeof navigator !== "undefined" ? navigator.userAgent : undefined;

	return {
		ip: data.ip,
		userAgent,
	};
}

