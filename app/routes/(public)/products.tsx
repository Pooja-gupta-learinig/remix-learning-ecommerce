
import type { Route } from "./+types/products";
import { AppLayout } from "../../layouts/AppLayouts";
import type { LoaderFunctionArgs } from "react-router";
import { fetchProducts } from "~/lib/products";
import ProductItem from "~/components/products/ProductItem";
import type { Product } from "~/types/product.types";
import { ProductsGridWrapper } from "~/components/products/products-grid-wrapper";


export function meta({}: Route.MetaArgs) {
	return [
		{ title: "Product Page" },
		{ name: "description", content: "Welcome to e-commerce site!" },
	];
}

export async function loader({ params, request }: LoaderFunctionArgs) {
	const productsData = await fetchProducts();

	return {
		productsData: productsData,
	};
}

export default function Products({
	loaderData,
}: Route.ComponentProps) {
	const { productsData } = loaderData;
	return (
		<AppLayout>
			<ProductsGridWrapper title="All Products">
				{productsData?.products?.map((product: Product) => (
					<ProductItem key={product.id} product={product} />
				))}
			</ProductsGridWrapper>
		</AppLayout>
	);
}
