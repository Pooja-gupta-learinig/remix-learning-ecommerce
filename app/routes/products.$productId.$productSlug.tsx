import type { Route } from "./+types/products.$productId.$productSlug";
import { AppLayout } from "../layouts/AppLayouts";
import { fetchProductById } from "~/lib/product-detail";
import type { ProductDetailLoaderData } from "~/types/product-detail.types";
import ProductDetails from "~/components/products/ProductDetails";
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

export default function Product({ loaderData }: Route.ComponentProps) {
  const { product } = loaderData;
  return (
    <AppLayout>
      <ProductDetails product={product} />
    </AppLayout>
  );
}
