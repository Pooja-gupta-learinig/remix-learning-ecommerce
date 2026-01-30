import type { Route } from "./+types/products.$productSlug.$productId.category.$categorySlug";
import { AppLayout } from "../layouts/AppLayouts";
import { fetchProductById } from "~/lib/product-detail";
import type { ProductDetailLoaderData } from "~/types/product-detail.types";
import ProductDetails from "~/components/products/ProductDetails";
import { useLoaderData , useParams } from "react-router";
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

export default function Product() {
  const { product } = useLoaderData<typeof loader>(); // product is the data fetched from the loader function in component	
	const { productSlug, productId, categorySlug } = useParams(); // hook to get the dynamic route parameters in route file and component also
	console.log(productSlug, productId, categorySlug);
  return (
    <AppLayout>
      <ProductDetails product={product} />
    </AppLayout>
  );
}
