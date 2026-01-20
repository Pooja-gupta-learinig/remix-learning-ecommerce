/**
 * @file Category products data fetching utilities
 */

import type { ProductsResponse } from "~/types/product.types";

/**
 * Fetches products for a specific category from the dummyjson API
 * @param categorySlug - The slug of the category to fetch products for
 * @returns Promise resolving to products response
 * @throws Response error if fetch fails or data is invalid
 */
export async function fetchCategoryProducts(
	categorySlug: string,
): Promise<ProductsResponse> {
	const response = await fetch(
		`https://dummyjson.com/products/category/${categorySlug}`,
	);

	if (!response.ok) {
		throw new Response(null, {
			status: 500,
			statusText: "Category products not found",
		});
	}

	const categoryProductsData: ProductsResponse = await response.json();

	if (!categoryProductsData || !categoryProductsData.products) {
		throw new Response("null", {
			status: 404,
			statusText: "Category products data not found",
		});
	}

	return categoryProductsData;
}

