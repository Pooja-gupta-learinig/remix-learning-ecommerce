import type { Route } from "./+types/products.category.$categorySlug";
import { AppLayout } from "../layouts/AppLayouts";
import { Await } from "react-router";
import { Suspense } from "react";
import { fetchCategoryProducts } from "~/lib/category-products";
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
		{ title: "Category Products Page" },
		{ name: "description", content: "Welcome to e-commerce site!" },
	];
}

export async function loader({ params }: Route.LoaderArgs) {
	const { categorySlug } = params;
	// Defer category products for streaming
	const categoryProductsPromise = fetchCategoryProducts(categorySlug);

	return defer({
		categorySlug,
		categoryProducts: categoryProductsPromise,
	});
}

function CategoryProductsList({ categoryProductsPromise, categorySlug }: { categoryProductsPromise: Promise<{ products: Product[] }>, categorySlug?: string }) {
	return (
		<Await resolve={categoryProductsPromise}>
			{(categoryProducts) => (
				<>
					{categoryProducts?.products?.map((product: Product) => (
						<ProductItem key={product.id} product={product} />
					))}
				</>
			)}
		</Await>
	);
}

export default function CategoryProducts({ loaderData }: Route.ComponentProps) {
  const { categoryProducts, categorySlug } = loaderData;
  const formattedCategorySlug = categorySlug?.replace(/-/g, " ") || "";
  return (
    <AppLayout>
      <ProductsGridWrapper title={`Category - ${formattedCategorySlug.charAt(0).toUpperCase() + formattedCategorySlug.slice(1)}` || "Category Products"}>
        <Suspense fallback={<ProductGridSkeleton count={8} />}>
          <CategoryProductsList categoryProductsPromise={categoryProducts} categorySlug={categorySlug} />
        </Suspense>
      </ProductsGridWrapper>
    </AppLayout>
  );
}
