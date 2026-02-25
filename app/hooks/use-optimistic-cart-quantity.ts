import type { FetcherWithComponents } from "react-router";
import { useRevalidator } from "react-router";
import { useEffect, useMemo, useRef } from "react";

/**
 * Hook for optimistic cart quantity updates
 * Provides immediate UI feedback while cart updates are in progress
 * Uses debounced revalidation to avoid expensive re-renders on every action
 * @param fetcher - The fetcher instance from useFetcher() in the component
 * @param productId - The product ID to track updates for
 * @param baseQuantity - The current quantity from the cart data
 * @returns The optimistic quantity (pending update or base quantity)
 */
export function useOptimisticCartQuantity(
	fetcher: FetcherWithComponents<unknown>,
	productId: number,
	baseQuantity: number
): number {
	const revalidator = useRevalidator();
	const revalidateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
	const lastActionRef = useRef<string | null>(null);

	// Track the action when submitting
	useEffect(() => {
		if (fetcher.formData && fetcher.state === "submitting") {
			const action = fetcher.formData.get("action");
			if (action) {
				lastActionRef.current = String(action);
			}
		}
	}, [fetcher.formData, fetcher.state]);

	// Optimistic update: use pending formData to show immediate UI feedback
	const optimisticQuantity = useMemo(() => {
		if (fetcher.formData && fetcher.state === "submitting") {
			const action = fetcher.formData.get("action");
			const pendingProductId = fetcher.formData.get("productId");

			if (action === "update" && String(pendingProductId) === String(productId)) {
				const quantity = fetcher.formData.get("quantity");
				if (quantity) {
					return Number(quantity);
				}
			}
		}
		return baseQuantity;
	}, [fetcher.formData, fetcher.state, baseQuantity, productId]);

	// Smart revalidation: Skip revalidation for update actions to make +/- buttons instant
	// Only revalidate for add/remove actions to update header cart count
	// For quantity updates, the UI is already optimistic and correct
	// Header will sync on next navigation or page refresh
	useEffect(() => {
		if (
			fetcher.data &&
			typeof fetcher.data === "object" &&
			"success" in fetcher.data &&
			fetcher.data.success &&
			fetcher.state === "idle"
		) {
			const action = lastActionRef.current;
			
			// Only revalidate for add/remove actions (to update header cart count)
			// Skip revalidation entirely for update actions - makes +/- buttons instant!
			if (action === "add" || action === "remove") {
				// Clear any pending revalidation
				if (revalidateTimeoutRef.current) {
					clearTimeout(revalidateTimeoutRef.current);
				}

				// Debounce revalidation to batch rapid add/remove actions
				revalidateTimeoutRef.current = setTimeout(() => {
					// Revalidate to sync cart state (including header cart count)
					revalidator.revalidate();
					revalidateTimeoutRef.current = null;
				}, 200); // 200ms delay for add/remove actions
			}
			// For "update" actions, we skip revalidation entirely - zero overhead!
			
			// Reset action ref after processing
			lastActionRef.current = null;
		}

		// Cleanup timeout on unmount
		return () => {
			if (revalidateTimeoutRef.current) {
				clearTimeout(revalidateTimeoutRef.current);
			}
		};
	}, [fetcher.data, fetcher.state, revalidator]);

	return optimisticQuantity;
}

