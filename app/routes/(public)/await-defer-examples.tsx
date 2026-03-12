import type { Route } from "./+types/await-defer-examples";
import { AppLayout } from "~/layouts/AppLayouts";
import type { LoaderFunctionArgs } from "react-router";
import { Await, useLoaderData } from "react-router";
import { fetchProducts } from "~/lib/products";
import { fetchUsers } from "~/lib/users";
import type { ProductsResponse } from "~/types/product.types";
import type { UsersResponse } from "~/lib/users";
import { Suspense } from "react";
import { capitalizeFirst } from "~/lib/utils";

/**
 * Helper function to create deferred data structure for React Router v7
 * This allows promises to be streamed in after initial render
 */
function defer<T extends Record<string, unknown>>(data: T): T {
	return data;
}

export function meta({}: Route.MetaArgs) {
	return [
		{ title: "Defer Examples - Products & Users" },
		{
			name: "description",
			content: "Examples of using defer() with await API calls for products and users",
		},
	];
}

/**
 * Example loader demonstrating defer() with:
 * 1. Immediate data (awaited) - critical data that must be ready before render
 * 2. Deferred product data - can stream in after initial render
 * 3. Deferred user data - can stream in after initial render
 */
export async function loader({ params, request }: LoaderFunctionArgs) {
	// 1. AWAIT API CALL - Critical data that must be ready immediately
	// This will block until the API call completes
	const criticalData = await fetch("https://dummyjson.com/products?limit=5");
	const criticalProducts: ProductsResponse = await criticalData.json();

	// 2. DEFER PRODUCT DATA - Non-critical data that can stream in
	// This promise will be resolved later, allowing the page to render immediately
	const productsPromise = fetchProducts({ delayTime: 2000 });

	// 3. DEFER USER DATA - Another non-critical data source
	// This also streams in after the initial render
	const usersPromise = fetchUsers();

	// Return with defer() - critical data is available immediately,
	// while products and users will stream in as they become available
	return defer({
		// Immediate data (awaited)
		criticalProducts,
		// Deferred promises (will resolve later)
		products: productsPromise,
		users: usersPromise,
	});
}

/**
 * Loading component for deferred data
 */
function DeferredDataLoader({
	children,
	fallback,
}: {
	children: React.ReactNode;
	fallback: React.ReactNode;
}) {
	return <Suspense fallback={fallback}>{children}</Suspense>;
}

/**
 * Product data component that uses Await for deferred data
 */
function ProductsList({ productsPromise }: { productsPromise: Promise<ProductsResponse> }) {
	return (
		<DeferredDataLoader fallback={<div className="text-gray-500">Loading products...</div>}>
			<Await resolve={productsPromise}>
				{(products) => (
					<div className="space-y-4">
						<h2 className="text-2xl font-bold">Products (Deferred)</h2>
						<p className="text-sm text-gray-600">
							Total: {products.total} products
						</p>
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
							{products.products.slice(0, 6).map((product) => (
								<div
									key={product.id}
									className="border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
								>
									<img
										src={product.thumbnail}
										alt={product.title}
										className="w-full h-48 object-cover rounded mb-2"
									/>
									<h3 className="font-semibold text-lg">{product.title}</h3>
									<p className="text-gray-600 text-sm line-clamp-2">
										{product.description}
									</p>
									<p className="text-blue-600 font-bold mt-2">
										${product.price}
									</p>
								</div>
							))}
						</div>
					</div>
				)}
			</Await>
		</DeferredDataLoader>
	);
}

/**
 * User data component that uses Await for deferred data
 */
function UsersList({ usersPromise }: { usersPromise: Promise<UsersResponse> }) {
	return (
		<DeferredDataLoader fallback={<div className="text-gray-500">Loading users...</div>}>
			<Await resolve={usersPromise}>
				{(users) => (
					<div className="space-y-4">
						<h2 className="text-2xl font-bold">Users (Deferred)</h2>
						<p className="text-sm text-gray-600">
							Total: {users.total} users
						</p>
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
							{users.users.slice(0, 6).map((user) => (
								<div
									key={user.id}
									className="border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
								>
									<div className="flex items-center gap-3 mb-2">
										<img
											src={user.image}
											alt={`${user.firstName} ${user.lastName}`}
											className="w-12 h-12 rounded-full object-cover"
										/>
										<div>
											<h3 className="font-semibold">
												{capitalizeFirst(user.firstName)} {capitalizeFirst(user.lastName)}
											</h3>
											<p className="text-sm text-gray-600">{user.email}</p>
										</div>
									</div>
									<div className="text-sm space-y-1">
										<p>
											<span className="font-medium">Age:</span> {user.age}
										</p>
										<p>
											<span className="font-medium">Phone:</span> {user.phone}
										</p>
										<p>
											<span className="font-medium">Location:</span>{" "}
											{user.address.city}, {user.address.state}
										</p>
									</div>
								</div>
							))}
						</div>
					</div>
				)}
			</Await>
		</DeferredDataLoader>
	);
}

export default function DeferExamples({
	loaderData,
}: Route.ComponentProps) {
	const { criticalProducts, products, users } = loaderData;

	return (
		<AppLayout>
			<div className="container mx-auto px-4 py-8 space-y-8">
				<h1 className="text-3xl font-bold mb-6">
					Defer() Examples with Await API Calls
				</h1>

				{/* Critical Products - Available Immediately (Awaited) */}
				<section className="space-y-4">
					<h2 className="text-2xl font-bold">Critical Products (Awaited)</h2>
					<p className="text-sm text-gray-600">
						This data was awaited in the loader, so it's available immediately
						on first render.
					</p>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
						{criticalProducts.products.map((product) => (
							<div
								key={product.id}
								className="border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
							>
								<img
									src={product.thumbnail}
									alt={product.title}
									className="w-full h-48 object-cover rounded mb-2"
								/>
								<h3 className="font-semibold text-lg">{product.title}</h3>
								<p className="text-gray-600 text-sm line-clamp-2">
									{product.description}
								</p>
								<p className="text-blue-600 font-bold mt-2">
									${product.price}
								</p>
							</div>
						))}
					</div>
				</section>

				{/* Deferred Products - Streams in after initial render */}
				<section className="space-y-4">
					<ProductsList productsPromise={products} />
				</section>

				{/* Deferred Users - Streams in after initial render */}
				<section className="space-y-4">
					<UsersList usersPromise={users} />
				</section>

				{/* Explanation Section */}
				<section className="mt-8 p-6 bg-gray-50 rounded-lg">
					<h2 className="text-xl font-bold mb-4">How This Works</h2>
					<div className="space-y-2 text-sm">
						<p>
							<strong>1. Awaited API Call (Critical Products):</strong> The
							loader uses <code className="bg-gray-200 px-1 rounded">await</code>{" "}
							to fetch critical data that must be available before the page
							renders.
						</p>
						<p>
							<strong>2. Deferred Products:</strong> The products promise is
							passed to <code className="bg-gray-200 px-1 rounded">defer()</code>{" "}
							and streams in after the initial render, improving perceived
							performance.
						</p>
						<p>
							<strong>3. Deferred Users:</strong> Similar to products, user data
							streams in asynchronously using React Router's{" "}
							<code className="bg-gray-200 px-1 rounded">Await</code> component.
						</p>
						<p className="mt-4 text-xs text-gray-600">
							The page renders immediately with critical data, while deferred
							data loads progressively, providing a better user experience.
						</p>
					</div>
				</section>
			</div>
		</AppLayout>
	);
}

