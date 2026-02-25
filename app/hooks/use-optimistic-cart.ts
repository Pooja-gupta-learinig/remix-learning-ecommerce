import type { FetcherWithComponents } from "react-router";
import { useRevalidator } from "react-router";
import { useEffect, useMemo, useRef } from "react";
import type { Product } from "~/types/product.types";

type CartItem = {
	productId: number;
	quantity: number;
	product: Product;
};

type CartData = {
	items: CartItem[];
	totalItems: number;
	totalPrice: number;
};

/**
 * Hook for optimistic cart updates on the cart page
 * Provides immediate UI feedback for items, totals, and prices while cart updates are in progress
 * Uses debounced revalidation to avoid expensive re-renders on every action
 * @param fetcher - The fetcher instance from useFetcher() in the component
 * @param baseCartData - The current cart data from the loader
 * @returns Optimistic cart data (pending updates or base data)
 */
export function useOptimisticCart(
	fetcher: FetcherWithComponents<unknown>,
	baseCartData: CartData
): CartData {
	const revalidator = useRevalidator();
	const revalidateTimeoutRef = useRef<NodeJS.Timeout | null>(null);

	// Optimistic updates: compute quantities and totals from pending formData
	const optimisticCart = useMemo(() => {
		if (fetcher.formData && fetcher.state === "submitting") {
			const action = fetcher.formData.get("action");
			const productId = fetcher.formData.get("productId");

			if (action === "update" && productId) {
				const newQuantity = Number(fetcher.formData.get("quantity"));
				const updatedItems = baseCartData.items.map((item) => {
					if (item.productId === Number(productId)) {
						return { ...item, quantity: newQuantity };
					}
					return item;
				});

				const updatedTotalItems = updatedItems.reduce(
					(sum, item) => sum + item.quantity,
					0
				);
				const updatedTotalPrice = updatedItems.reduce((sum, item) => {
					const discountedPrice =
						item.product.price -
						(item.product.price * item.product.discountPercentage) / 100;
					return sum + discountedPrice * item.quantity;
				}, 0);

				return {
					items: updatedItems,
					totalItems: updatedTotalItems,
					totalPrice: updatedTotalPrice,
				};
			}

			// Handle remove action optimistically
			if (action === "remove" && productId) {
				const updatedItems = baseCartData.items.filter(
					(item) => item.productId !== Number(productId)
				);

				const updatedTotalItems = updatedItems.reduce(
					(sum, item) => sum + item.quantity,
					0
				);
				const updatedTotalPrice = updatedItems.reduce((sum, item) => {
					const discountedPrice =
						item.product.price -
						(item.product.price * item.product.discountPercentage) / 100;
					return sum + discountedPrice * item.quantity;
				}, 0);

				return {
					items: updatedItems,
					totalItems: updatedTotalItems,
					totalPrice: updatedTotalPrice,
				};
			}
		}
		return baseCartData;
	}, [
		fetcher.formData,
		fetcher.state,
		baseCartData.items,
		baseCartData.totalItems,
		baseCartData.totalPrice,
	]);

	// Debounced revalidation: only revalidate after a short delay to batch multiple updates
	// This prevents expensive re-renders on every rapid click
	useEffect(() => {
		if (fetcher.data?.success && fetcher.state === "idle") {
			// Clear any pending revalidation
			if (revalidateTimeoutRef.current) {
				clearTimeout(revalidateTimeoutRef.current);
			}

			// Debounce revalidation to batch rapid updates (shorter delay for better UX)
			revalidateTimeoutRef.current = setTimeout(() => {
				// Revalidate both root (for header) and current route (for cart page)
				revalidator.revalidate();
				revalidateTimeoutRef.current = null;
			}, 150); // 150ms delay - short enough to feel responsive, long enough to batch clicks
		}

		// Cleanup timeout on unmount
		return () => {
			if (revalidateTimeoutRef.current) {
				clearTimeout(revalidateTimeoutRef.current);
			}
		};
	}, [fetcher.data, fetcher.state, revalidator]);

	return optimisticCart;
}

