
import type { Route } from "./+types/products";
import { AppLayout } from "../../layouts/AppLayouts";
import type { LoaderFunctionArgs } from "react-router";
import { Await } from "react-router";
import { Suspense } from "react";
import { fetchProducts } from "~/lib/products";
import ProductItem from "~/components/products/ProductItem";
import type { Product } from "~/types/product.types";
import { ProductsGridWrapper } from "~/components/products/products-grid-wrapper";
import { ProductGridSkeleton } from "~/components/common/Skeleton";

/**
 * Helper function to create deferred data structure for React Router v7
 * This allows promises to be streamed in after initial render
 */
function defer<T extends Record<string, unknown>>(data: T): T {
	return data;
}


export function meta({}: Route.MetaArgs) {
	return [
		{ title: "Product Page" },
		{ name: "description", content: "Welcome to e-commerce site!" },
	];
}

export async function loader({ params, request }: LoaderFunctionArgs) {
	// Defer products data for streaming
	const productsPromise = fetchProducts({});

	return defer({
		productsData: productsPromise,
	});
}

function ProductsList({ productsPromise }: { productsPromise: Promise<{ products: Product[] }> }) {
	return (
		<Await resolve={productsPromise}>
			{(productsData) => (
				<>
					{productsData?.products?.map((product: Product) => (
						<ProductItem key={product.id} product={product} />
					))}
				</>
			)}
		</Await>
	);
}

export default function Products({
	loaderData,
}: Route.ComponentProps) {
	const { productsData } = loaderData;
	return (
		<AppLayout>
			 <ProductsGridWrapper title="All Products">
				<Suspense fallback={<ProductGridSkeleton count={8} />}>
					<ProductsList productsPromise={productsData} />
				</Suspense>
			</ProductsGridWrapper>
		</AppLayout>
	);
}
