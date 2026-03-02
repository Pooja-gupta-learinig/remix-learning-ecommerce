import type { LoaderFunctionArgs } from "react-router";
import { AppLayout } from "../../layouts/AppLayouts";
import type { Route } from "./+types/categories";
import { fetchCategories } from "~/lib/categories";
import { Link } from "react-router";
import { ShoppingBag } from "lucide-react";
import type { Category } from "~/types/category.types";

export function meta({}: Route.MetaArgs) {
	return [
		{ title: "Categories - E-CommerceShop" },
		{ name: "description", content: "Browse all product categories" },
	];
}

export async function loader({ params, request }: LoaderFunctionArgs) {
	const categoriesData = await fetchCategories();
	return {
		categoriesData: categoriesData,
	};
}

export default function Categories({ loaderData }: Route.ComponentProps) {
	const { categoriesData } = loaderData;

	const categorySlug = (category: Category): string => {
		// Use the slug if available, otherwise generate from name
		if (category.slug) {
			return category.slug;
		}
		return category.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
	};

	return (
		<AppLayout hasSidebar={false}>
			<section className="bg-gray-50 min-h-screen py-16">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
						{categoriesData.map((category: Category) => (
							<Link
								key={category.slug || category.name}
								to={`/products/category/${categorySlug(category)}`}
								className="group bg-white rounded-lg p-8 shadow-sm hover:shadow-lg transition-all duration-200 flex flex-col items-center justify-center text-center aspect-square"
							>
								<div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-b from-purple-400 to-purple-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
									<ShoppingBag className="w-8 h-8 sm:w-10 sm:h-10 text-white stroke-2" />
								</div>
								<h3 className="font-medium text-gray-900 capitalize text-sm sm:text-base">
									{category.name}
								</h3>
							</Link>
						))}
					</div>
				</div>
			</section>
		</AppLayout>
	);
}
