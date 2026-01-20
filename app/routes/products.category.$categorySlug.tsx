import type { Route } from "./+types/products.category.$categorySlug";
import { AppLayout } from "../layouts/AppLayouts";
import { fetchCategoryProducts } from "~/lib/category-products";
import { useLoaderData } from "react-router";
import ProductItem from "~/components/products/ProductItem";
import type { Product } from "~/types/product.types";
import { ProductsGridWrapper } from "~/components/products/products-grid-wrapper";

export function meta({}: Route.MetaArgs) {
	return [
		{ title: "Category Products Page" },
		{ name: "description", content: "Welcome to e-commerce site!" },
	];
}

export async function loader({ params }: Route.LoaderArgs) {
	const { categorySlug } = params;
	const categoryProducts = await fetchCategoryProducts(categorySlug);

	return {
		categorySlug,
		categoryProducts,
	};
} 


export default function CategoryProducts({ loaderData }: Route.ComponentProps) {
  const { categoryProducts, categorySlug } = loaderData;
  const formattedCategorySlug = categorySlug?.replace(/-/g, " ") || "";
  return (
    <AppLayout>
      <ProductsGridWrapper title={`Category - ${formattedCategorySlug.charAt(0).toUpperCase() + formattedCategorySlug.slice(1)}` || "Category Products"}>
        {categoryProducts?.products?.map((product: Product) => (
          <ProductItem key={product.id} product={product} />
        ))}
      </ProductsGridWrapper>
    </AppLayout>
  );
}
