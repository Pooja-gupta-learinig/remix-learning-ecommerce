import type { Route } from "./+types/products.$productSlug.$productId.category.$categorySlug";
import { AppLayout } from "../layouts/AppLayouts";
import { fetchProductById } from "~/lib/product-detail";
import type { ProductDetailLoaderData } from "~/types/product-detail.types";
import ProductDetails from "~/components/products/ProductDetails";
import { useLoaderData , useParams, redirect } from "react-router";
export function meta({}: Route.MetaArgs) {
	return [
		{ title: "Product Page" },
		{ name: "description", content: "Welcome to e-commerce site!" },
	];
}

export async function loader({
	params,
}: Route.LoaderArgs): Promise<ProductDetailLoaderData> {
	const { productId } = params;
	const product = await fetchProductById(productId);
	
	return { product };
}

/**
 * Server-side Action Function
 * 
 * Handles product deletion via DELETE method.
 * Calls the DummyJSON API to delete the product.
 */
export async function action({ request, params }: Route.ActionArgs) {
	const { productId } = params;
	
	if (!productId) {
		return { error: "Product ID is required" };
	}

	if (request.method === "DELETE") {
		try {
			const response = await fetch(`https://dummyjson.com/products/${productId}`, {
				method: "DELETE",
			});

			if (!response.ok) {
				return { error: "Failed to delete product" };
			}

			// Redirect to products page after successful deletion
			return redirect("/products");
		} catch (error) {
			console.error("Error deleting product:", error);
			return { error: "An error occurred while deleting the product" };
		}
	}

	return { error: "Invalid request method" };
}

export default function Product() {
  const { product } = useLoaderData<typeof loader>(); // product is the data fetched from the loader function in component	
	const { productSlug, productId, categorySlug } = useParams(); // hook to get the dynamic route parameters in route file and component also
	console.log(productSlug, productId, categorySlug);
	console.log('product', product);
  return (
    <AppLayout>
      <ProductDetails product={product} />
    </AppLayout>
  );
}
