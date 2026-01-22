/**
 * @file Product search data fetching utilities
 */

import type { ProductsResponse } from "~/types/product.types";

/**
 * Searches products with optional category filter
 * @param searchQuery - The search query string
 * @param categorySlug - Optional category slug to filter by
 * @returns Promise resolving to products response
 * @throws Response error if fetch fails or data is invalid
 */
export async function searchProducts(
	searchQuery: string,
	categorySlug?: string,
): Promise<ProductsResponse> {
	if (!searchQuery || searchQuery.trim().length === 0) {
		throw new Response("Search query is required", {
			status: 400,
			statusText: "Bad Request",
		});
	}

	// If category is provided, fetch category products and filter them
	if (categorySlug) {
		const categoryResponse = await fetch(
			`https://dummyjson.com/products/category/${categorySlug}`,
		);

		if (!categoryResponse.ok) {
			throw new Response(null, {
				status: 500,
				statusText: "Category products not found",
			});
		}

		const categoryData: ProductsResponse = await categoryResponse.json();

	//console.log("Category Data:", categoryData.products);

		if (!categoryData || !categoryData.products) {
			throw new Response("null", {
				status: 404,
				statusText: "Category products data not found",
			});
		}

		

		// Filter products by search query (case-insensitive)
		const searchLower = searchQuery.toLowerCase().trim();
		

		const filteredProducts = categoryData.products.filter((product) => {
			// Safely check each field with null/undefined guards and handle empty strings
			const title = (product.title || "").toLowerCase();
			const description = (product.description || "").toLowerCase();
			const brand = (product.brand || "").toLowerCase();
			const category = (product.category || "").toLowerCase();

			const titleMatch = title.includes(searchLower);
			const descriptionMatch = description.includes(searchLower);
			const brandMatch = brand.includes(searchLower);
			const categoryMatch = category.includes(searchLower);

			const matches = titleMatch || descriptionMatch || brandMatch || categoryMatch;
			
			// if (matches) {
			// 	console.log("Product matched:", product.title, {
			// 		titleMatch,
			// 		descriptionMatch,
			// 		brandMatch,
			// 		categoryMatch,
			// 	});
			// }

			return matches;
		});

		

		return {
			products: filteredProducts,
			total: filteredProducts.length,
			skip: 0,
			limit: filteredProducts.length,
		};
	}

	
	// Direct product search using dummyjson search API
	const response = await fetch(
		`https://dummyjson.com/products/search?q=${encodeURIComponent(searchQuery)}`,
	);

	if (!response.ok) {
		throw new Response(null, {
			status: 500,
			statusText: "Product search failed",
		});
	}

	const searchData: ProductsResponse = await response.json();


	if (!searchData || !searchData.products) {
		throw new Response("null", {
			status: 404,
			statusText: "Search results not found",
		});
	}

	return searchData;
}

