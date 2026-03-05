import type { Route } from "./+types/products.$productSlug.$productId.category.$categorySlug";
import { AppLayout } from "../layouts/AppLayouts";
import { fetchProductById } from "~/lib/product-detail";
import type { ProductDetailLoaderData } from "~/types/product-detail.types";
import ProductDetails from "~/components/products/ProductDetails";
import { useLoaderData , useParams, redirect } from "react-router";
export function meta({ matches }: Route.MetaArgs) {
	const data = matches[matches.length - 1]?.data as ProductDetailLoaderData | undefined;
	if (!data?.product) {
		return [
			{ title: "Product Not Found" },
			{ name: "description", content: "The product you're looking for could not be found." },
		];
	}

	const { product } = data;
	const title = `${product.title} - ${product.brand} | E-Commerce Shop`;
	const description = product.description.length > 160 
		? `${product.description.substring(0, 157)}...` 
		: product.description;
	const price = product.price.toFixed(2);
	const discountPrice = product.discountPercentage > 0
		? (product.price * (1 - product.discountPercentage / 100)).toFixed(2)
		: null;

	return [
		{ title },
		{ name: "description", content: description },
		{ name: "keywords", content: `${product.title}, ${product.brand}, ${product.category}, ${product.availabilityStatus}` },
		
		// Open Graph tags
		{ property: "og:title", content: title },
		{ property: "og:description", content: description },
		{ property: "og:image", content: product.thumbnail },
		{ property: "og:type", content: "product" },
		{ property: "og:price:amount", content: price },
		{ property: "og:price:currency", content: "USD" },
		
		// Twitter Card tags
		{ name: "twitter:card", content: "summary_large_image" },
		{ name: "twitter:title", content: title },
		{ name: "twitter:description", content: description },
		{ name: "twitter:image", content: product.thumbnail },
		
		// Product-specific meta tags
		{ name: "product:brand", content: product.brand },
		{ name: "product:category", content: product.category },
		{ name: "product:price:amount", content: price },
		{ name: "product:price:currency", content: "USD" },
		...(discountPrice ? [{ name: "product:price:discount", content: discountPrice }] : []),
		{ name: "product:availability", content: product.availabilityStatus },
		{ name: "product:rating", content: product.rating.toString() },
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
