import type { Route } from "./+types/home";
import { AppLayout } from "../../layouts/AppLayouts";
import { Link, Await } from "react-router";
import { Suspense } from "react";
import { fetchProducts } from "~/lib/products";
import { fetchCategories } from "~/lib/categories";
import ProductItem from "~/components/products/ProductItem";
import type { Product } from "~/types/product.types";
import type { Category } from "~/types/category.types";
import { ShoppingBag, Star, Truck, Shield, Headphones, ArrowRight, Sparkles } from "lucide-react";
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
		{ title: "Home - E-CommerceShop" },
		{ name: "description", content: "Discover amazing products at unbeatable prices. Shop the latest trends and enjoy fast, free shipping!" },
	];
}

export async function loader() {
	// Fetch categories immediately (fast, needed for layout)
	const categoriesPromise = fetchCategories();

	// Defer products data (slower, can stream in)
	const productsPromise = fetchProducts({});

	return defer({
		categories: categoriesPromise,
		productsData: productsPromise,
	});
}

function FeaturedProducts({ productsPromise }: { productsPromise: Promise<{ products: Product[] }> }) {
	return (
		<Await resolve={productsPromise}>
			{(productsData) => {
				// Get featured products (top-rated products with discount)
				const featuredProducts = productsData.products
					.filter((product) => product.rating >= 4.5 && product.discountPercentage > 0)
					.sort((a, b) => b.rating - a.rating)
					.slice(0, 4);

				return (
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
						{featuredProducts.map((product: Product) => (
							<ProductItem key={product.id} product={product} />
						))}
					</div>
				);
			}}
		</Await>
	);
}

function BestDeals({ productsPromise }: { productsPromise: Promise<{ products: Product[] }> }) {
	return (
		<Await resolve={productsPromise}>
			{(productsData) => {
				// Get best deals (highest discount percentage)
				const bestDeals = productsData.products
					.filter((product) => product.discountPercentage > 15)
					.sort((a, b) => b.discountPercentage - a.discountPercentage)
					.slice(0, 4);

				if (bestDeals.length === 0) {
					return null;
				}

				return (
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
						{bestDeals.map((product: Product) => (
							<ProductItem key={product.id} product={product} />
						))}
					</div>
				);
			}}
		</Await>
	);
}

function CategoriesList({ categoriesPromise, categorySlug }: { categoriesPromise: Promise<Category[]>, categorySlug: (category: Category) => string }) {
	return (
		<Await resolve={categoriesPromise}>
			{(categories) => (
				<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
					{categories.slice(0, 8).map((category: Category) => (
						<Link
							key={category.slug || category.name}
							to={`/products/category/${categorySlug(category)}`}
							prefetch="intent"
							className="group bg-white rounded-xl p-6 shadow-sm hover:shadow-lg transition-all duration-200 transform hover:scale-105 border border-gray-200"
						>
							<div className="flex flex-col items-center text-center">
								<div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
									<ShoppingBag className="w-8 h-8 text-white" />
								</div>
								<h3 className="font-semibold text-gray-900 capitalize group-hover:text-indigo-600 transition-colors">
									{category.name}
								</h3>
							</div>
						</Link>
					))}
				</div>
			)}
		</Await>
	);
}

export default function Home({ loaderData }: Route.ComponentProps) {
	const { categories, productsData } = loaderData;

	const categorySlug = (category: Category): string => {
		// Use the slug if available, otherwise generate from name
		if (category.slug) {
			return category.slug;
		}
		return category.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
	};

	return (
		<AppLayout hasSidebar={false}>
			{/* Hero Section */}
			<section className="relative bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 text-white overflow-hidden">
				<div className="absolute inset-0 bg-black/10"></div>
				<div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24 lg:py-32">
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
						<div className="text-center lg:text-left">
							<div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
								<Sparkles className="w-4 h-4" />
								<span className="text-sm font-semibold">New Collection 2026</span>
							</div>
							<h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
								Shop Smart,{" "}
								<span className="text-yellow-300">Live Better</span>
							</h1>
							<p className="text-lg sm:text-xl text-indigo-100 mb-8 max-w-xl mx-auto lg:mx-0">
								Discover amazing products at unbeatable prices. Quality you can trust, delivered to your door.
							</p>
							<div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
								<Link
									to="/products"
									prefetch="intent"
									className="inline-flex items-center justify-center gap-2 bg-white text-indigo-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
								>
									Shop Now
									<ArrowRight className="w-5 h-5" />
								</Link>
								<Link
									to="/categories"
									prefetch="intent"
									className="inline-flex items-center justify-center gap-2 bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white/10 transition-all duration-200"
								>
									Browse Categories
								</Link>
							</div>
						</div>
						<div className="hidden lg:block">
							<div className="relative">
								<div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-3xl transform rotate-6 opacity-20"></div>
								<div className="relative bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20">
									<div className="grid grid-cols-2 gap-4">
										{[1, 2, 3, 4].map((i) => (
											<div key={i} className="bg-white/20 rounded-xl p-4 backdrop-blur-sm">
												<div className="w-full h-32 bg-white/30 rounded-lg mb-2"></div>
												<div className="h-2 bg-white/30 rounded w-3/4"></div>
											</div>
										))}
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Features Section */}
			<section className="bg-white py-12 border-b">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
						<div className="flex items-center gap-4 p-4 rounded-lg hover:bg-gray-50 transition-colors">
							<div className="flex-shrink-0 w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
								<Truck className="w-6 h-6 text-indigo-600" />
							</div>
							<div>
								<h3 className="font-semibold text-gray-900">Free Shipping</h3>
								<p className="text-sm text-gray-600">On orders over $50</p>
							</div>
						</div>
						<div className="flex items-center gap-4 p-4 rounded-lg hover:bg-gray-50 transition-colors">
							<div className="flex-shrink-0 w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
								<Shield className="w-6 h-6 text-indigo-600" />
							</div>
							<div>
								<h3 className="font-semibold text-gray-900">Secure Payment</h3>
								<p className="text-sm text-gray-600">100% secure checkout</p>
							</div>
						</div>
						<div className="flex items-center gap-4 p-4 rounded-lg hover:bg-gray-50 transition-colors">
							<div className="flex-shrink-0 w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
								<Headphones className="w-6 h-6 text-indigo-600" />
							</div>
							<div>
								<h3 className="font-semibold text-gray-900">24/7 Support</h3>
								<p className="text-sm text-gray-600">Dedicated support team</p>
							</div>
						</div>
						<div className="flex items-center gap-4 p-4 rounded-lg hover:bg-gray-50 transition-colors">
							<div className="flex-shrink-0 w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
								<Star className="w-6 h-6 text-indigo-600" />
							</div>
							<div>
								<h3 className="font-semibold text-gray-900">Quality Products</h3>
								<p className="text-sm text-gray-600">Premium quality guaranteed</p>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Categories Section */}
			<section className="bg-gray-50 py-16">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="text-center mb-12">
						<h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
							Shop by Category
						</h2>
						<p className="text-lg text-gray-600 max-w-2xl mx-auto">
							Explore our wide range of product categories
						</p>
					</div>
					<Suspense fallback={<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
						{Array.from({ length: 8 }).map((_, i) => (
							<div key={i} className="bg-white rounded-xl p-6 border border-gray-200 animate-pulse">
								<div className="flex flex-col items-center text-center">
									<div className="w-16 h-16 bg-gray-200 rounded-full mb-4" />
									<div className="h-4 bg-gray-200 rounded w-20" />
								</div>
							</div>
						))}
					</div>}>
						<CategoriesList categoriesPromise={categories} categorySlug={categorySlug} />
					</Suspense>
					<div className="text-center mt-10">
						<Link
							to="/categories"
							prefetch="intent"
							className="inline-flex items-center gap-2 text-indigo-600 font-semibold hover:text-indigo-700 transition-colors"
						>
							View All Categories
							<ArrowRight className="w-4 h-4" />
						</Link>
					</div>
				</div>
			</section>

			{/* Best Deals Section */}
			<section className="bg-gradient-to-r from-red-50 to-orange-50 py-16">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex items-center justify-between mb-8">
						<div>
							<h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
								🔥 Best Deals
							</h2>
							<p className="text-lg text-gray-600">
								Limited time offers - Don't miss out!
							</p>
						</div>
						<Link
							to="/products"
							prefetch="intent"
							className="hidden sm:inline-flex items-center gap-2 text-indigo-600 font-semibold hover:text-indigo-700 transition-colors"
						>
							View All
							<ArrowRight className="w-4 h-4" />
						</Link>
					</div>
					<Suspense fallback={<ProductGridSkeleton count={4} />}>
						<BestDeals productsPromise={productsData} />
					</Suspense>
				</div>
			</section>

			{/* Featured Products Section */}
			<section className="bg-white py-16">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex items-center justify-between mb-8">
						<div>
							<h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
								⭐ Featured Products
							</h2>
							<p className="text-lg text-gray-600">
								Handpicked products just for you
							</p>
						</div>
						<Link
							to="/products"
							prefetch="intent"
							className="hidden sm:inline-flex items-center gap-2 text-indigo-600 font-semibold hover:text-indigo-700 transition-colors"
						>
							View All
							<ArrowRight className="w-4 h-4" />
						</Link>
					</div>
					<Suspense fallback={<ProductGridSkeleton count={4} />}>
						<FeaturedProducts productsPromise={productsData} />
					</Suspense>
					<div className="text-center mt-10">
						<Link
							to="/products"
							prefetch="intent"
							className="inline-flex items-center gap-2 bg-indigo-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors shadow-md hover:shadow-lg"
						>
							Explore All Products
							<ArrowRight className="w-5 h-5" />
						</Link>
					</div>
				</div>
			</section>

			{/* CTA Section */}
			<section className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white py-16">
				<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
					<h2 className="text-3xl sm:text-4xl font-bold mb-4">
						Ready to Start Shopping?
					</h2>
					<p className="text-xl text-indigo-100 mb-8">
						Join thousands of satisfied customers and discover amazing products today.
					</p>
					<Link
						to="/products"
						prefetch="intent"
						className="inline-flex items-center gap-2 bg-white text-indigo-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
					>
						Start Shopping Now
						<ArrowRight className="w-5 h-5" />
					</Link>
				</div>
			</section>
		</AppLayout>
	);
}
