import type { Route } from "./+types/product.search";
import { AppLayout } from "../layouts/AppLayouts";
import type { LoaderFunctionArgs } from "react-router";
import { searchProducts } from "~/lib/product-search";
import ProductItem from "~/components/products/ProductItem";
import type { Product } from "~/types/product.types";
import { ProductsGridWrapper } from "~/components/products/products-grid-wrapper";

export function meta({}: Route.MetaArgs) {
	return [
		{ title: "Search Products" },
		{ name: "description", content: "Search for products" },
	];
}

export async function loader({ request }: LoaderFunctionArgs) {
	const url = new URL(request.url);
	const searchQuery = url.searchParams.get("q") || "";
	const categorySlug = url.searchParams.get("category") || undefined;


	// Validate search query
	if (!searchQuery || searchQuery.trim().length === 0) {
		return {
			searchQuery: "",
			categorySlug: categorySlug || null,
			productsData: null,
			error: "Please enter a search query",
		};
	}

	try {
		const productsData = await searchProducts(searchQuery, categorySlug);

	

		// Check if no products found
		if (!productsData.products || productsData.products.length === 0) {
			return {
				searchQuery,
				categorySlug: categorySlug || null,
				productsData: null,
				error: categorySlug
					? `No products found for "${searchQuery}" in this category`
					: `No products found for "${searchQuery}"`,
			};
		}

		return {
			searchQuery,
			categorySlug: categorySlug || null,
			productsData,
			error: null,
		};
	} catch (error) {
		return {
			searchQuery,
			categorySlug: categorySlug || null,
			productsData: null,
			error:
				error instanceof Response
					? error.statusText
					: "An error occurred while searching for products",
		};
	}
}

export default function ProductSearch({ loaderData }: Route.ComponentProps) {
	const { searchQuery, categorySlug, productsData, error } = loaderData;

	const title = categorySlug
		? `Search Results in ${categorySlug.replace(/-/g, " ")}`
		: "Search Results";

	return (
		<AppLayout>
			<ProductsGridWrapper
				title={searchQuery ? `${title} for "${searchQuery}"` : title}
			>
				{error ? (
					<div className="col-span-full text-center py-12">
						<p className="text-red-600 text-lg font-medium">{error}</p>
						<p className="text-gray-600 mt-2">
							Try adjusting your search terms or browse all products.
						</p>
					</div>
				) : productsData?.products ? (
					productsData.products.map((product: Product) => (
						<ProductItem key={product.id} product={product} />
					))
				) : null}
			</ProductsGridWrapper>
		</AppLayout>
	);
}

