/**
 * @file Category data fetching utilities
 */

import type { CategoriesResponse } from "~/types/category.types";

/**
 * Fetches categories from the dummyjson API
 * @returns Promise resolving to categories response
 * @throws Response error if fetch fails or data is invalid
 */
export async function fetchCategories(): Promise<CategoriesResponse> {
	const response = await fetch("https://dummyjson.com/products/categories");

	if (!response.ok) {
		throw new Response(null, {
			status: 500,
			statusText: "Categories not found",
		});
	}

	const categoriesData: CategoriesResponse = await response.json();

	if (!categoriesData || !Array.isArray(categoriesData)) {
		throw new Response("null", {
			status: 404,
			statusText: "Categories data not found",
		});
	}

	return categoriesData;
}

