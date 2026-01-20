/**
 * @file Product detail data fetching utilities
 */

import type { Product } from "~/types/product.types";

/**
 * Fetches a single product by ID from the dummyjson API
 * @param productId - The ID of the product to fetch
 * @returns Promise resolving to product data
 * @throws Response error if fetch fails or product is not found
 */
export async function fetchProductById(productId: string): Promise<Product> {
	const response = await fetch(`https://dummyjson.com/products/${productId}`);

	if (!response.ok) {
		throw new Response(null, {
			status: response.status === 404 ? 404 : 500,
			statusText: response.status === 404 ? "Product not found" : "Failed to fetch product",
		});
	}

	const product: Product = await response.json();

	if (!product || !product.id) {
		throw new Response(null, {
			status: 404,
			statusText: "Product data not found",
		});
	}

	return product;
}

