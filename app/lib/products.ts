/**
 * @file Product data fetching utilities
 */

import type { ProductsResponse } from "~/types/product.types";

/**
 * Fetches products from the dummyjson API
 * @returns Promise resolving to products response
 * @throws Response error if fetch fails or data is invalid
 */
export async function fetchProducts(): Promise<ProductsResponse> {
	const response = await fetch("https://dummyjson.com/products");

	if (!response.ok) {
		throw new Response(null, {
			status: 500,
			statusText: "Products not found",
		});
	}

	const productsData: ProductsResponse = await response.json();

	if (!productsData || !productsData.products) {
		throw new Response("null", {
			status: 404,
			statusText: "Products data not found",
		});
	}

	return productsData;
}

