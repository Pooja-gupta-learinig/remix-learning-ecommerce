import type { Route } from "./+types/use-fetcher-defer-dashboard";
import { AppLayout } from "~/layouts/AppLayouts";
import type { LoaderFunctionArgs } from "react-router";
import { Await, useFetcher, useLoaderData } from "react-router";
import { fetchProducts } from "~/lib/products";
import { fetchUsers } from "~/lib/users";
import type { ProductsResponse } from "~/types/product.types";
import type { UsersResponse } from "~/lib/users";
import { Suspense, useState, useEffect } from "react";

/**
 * Tab component for organizing dashboard sections
 */
type Tab = "independent" | "products" | "users" | "combined" | "docs";

function Tabs({
	activeTab,
	onTabChange,
}: {
	activeTab: Tab;
	onTabChange: (tab: Tab) => void;
}) {
	const tabs: { id: Tab; label: string; icon: string }[] = [
		{ id: "independent", label: "Independent Fetchers", icon: "🔀" },
		{ id: "products", label: "Products", icon: "📦" },
		{ id: "users", label: "Users", icon: "👥" },
		{ id: "combined", label: "Combined", icon: "⚡" },
		{ id: "docs", label: "Documentation", icon: "📚" },
	];

	return (
		<div className="border-b border-gray-200 mb-6">
			<nav className="flex space-x-1 overflow-x-auto" aria-label="Tabs">
				{tabs.map((tab) => (
					<button
						key={tab.id}
						onClick={() => onTabChange(tab.id)}
						className={`
							px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors
							${
								activeTab === tab.id
									? "border-b-2 border-blue-600 text-blue-600 bg-blue-50"
									: "text-gray-500 hover:text-gray-700 hover:border-b-2 hover:border-gray-300"
							}
						`}
					>
						<span className="mr-2">{tab.icon}</span>
						{tab.label}
					</button>
				))}
			</nav>
		</div>
	);
}

/**
 * Helper function to create deferred data structure for React Router v7
 */
function defer<T extends Record<string, unknown>>(data: T): T {
	return data;
}

export function meta({}: Route.MetaArgs) {
	return [
		{ title: "useFetcher + Defer Dashboard Demo" },
		{
			name: "description",
			content: "Interactive dashboard demonstrating useFetcher with defer for streaming data on-demand",
		},
	];
}

/**
 * Loader for the initial page - returns minimal data
 * The real magic happens with useFetcher actions
 */
export async function loader({ params, request }: LoaderFunctionArgs) {
	// Return minimal initial data
	return {
		message: "Dashboard ready - click buttons to load data on-demand",
	};
}

/**
 * Action handler for fetching products on-demand
 * This is called when useFetcher submits to this route
 */
export async function action({ request }: LoaderFunctionArgs) {
	const formData = await request.formData();
	const actionType = formData.get("actionType") as string;
	const delayTime = formData.get("delayTime") ? Number(formData.get("delayTime")) : undefined;

	if (actionType === "fetchProducts") {
		// Return deferred promise - this will stream in
		const productsPromise = fetchProducts({ delayTime });
		return defer({
			products: productsPromise,
			timestamp: new Date().toISOString(),
		});
	}

	if (actionType === "fetchUsers") {
		// Return deferred promise - this will stream in
		const usersPromise = fetchUsers();
		return defer({
			users: usersPromise,
			timestamp: new Date().toISOString(),
		});
	}

	if (actionType === "fetchBoth") {
		// Fetch both in parallel - both will stream in independently
		const productsPromise = fetchProducts({ delayTime: 2000 });
		const usersPromise = fetchUsers();
		return defer({
			products: productsPromise,
			users: usersPromise,
			timestamp: new Date().toISOString(),
		});
	}

	return { error: "Unknown action type" };
}

/**
 * Dashboard Section Component for Products
 * Uses useFetcher to load data on-demand with streaming
 */
function ProductsDashboardSection({ isActive }: { isActive: boolean }) {
	const fetcher = useFetcher<typeof action>();
	const [refreshCount, setRefreshCount] = useState(0);

	const isLoading = fetcher.state === "loading" || fetcher.state === "submitting";
	const hasData = fetcher.data && "products" in fetcher.data;
	const productsData = fetcher.data && "products" in fetcher.data ? fetcher.data : null;
	const timestamp = productsData && "timestamp" in productsData ? productsData.timestamp : undefined;

	// Auto-load when tab becomes active and data doesn't exist
	useEffect(() => {
		if (isActive && !hasData && !isLoading) {
			fetcher.submit(
				{ actionType: "fetchProducts", delayTime: "1000" },
				{ method: "post" }
			);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isActive]);

	const handleLoadProducts = () => {
		setRefreshCount((prev) => prev + 1);
		fetcher.submit(
			{ actionType: "fetchProducts", delayTime: "1000" },
			{ method: "post" }
		);
	};

	return (
		<div className="border rounded-lg p-6 bg-white shadow-sm">
			<div className="flex items-center justify-between mb-4">
				<div>
					<h2 className="text-2xl font-bold">Products Dashboard</h2>
					<p className="text-sm text-gray-600">
						Load products on-demand with streaming
					</p>
				</div>
				<button
					onClick={handleLoadProducts}
					disabled={isLoading}
					className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
					title={hasData ? "Refresh to fetch new records" : "Load products"}
				>
					{isLoading ? "Loading..." : hasData ? "🔄 Refresh" : "Load Products"}
				</button>
			</div>

			{productsData && productsData.products && (
				<Suspense fallback={<div className="text-gray-500">Streaming products...</div>}>
					<Await resolve={productsData.products}>
						{(products: ProductsResponse) => (
							<div className="space-y-4">
								<div className="flex items-center justify-between">
									<p className="text-sm text-gray-600">
										Loaded {products.total} products (Refresh #{refreshCount})
									</p>
									{timestamp && (
										<p className="text-xs text-gray-400">
											Loaded at: {new Date(timestamp).toLocaleTimeString()}
										</p>
									)}
								</div>
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
				</Suspense>
			)}

			{!hasData && !isLoading && (
				<div className="text-center py-8 text-gray-400">
					{isActive ? "Loading data automatically..." : "Switch to this tab to load data"}
				</div>
			)}
		</div>
	);
}

/**
 * Dashboard Section Component for Users
 * Uses useFetcher to load data on-demand with streaming
 */
function UsersDashboardSection({ isActive }: { isActive: boolean }) {
	const fetcher = useFetcher<typeof action>();
	const [refreshCount, setRefreshCount] = useState(0);

	const isLoading = fetcher.state === "loading" || fetcher.state === "submitting";
	const hasData = fetcher.data && "users" in fetcher.data;
	const usersData = fetcher.data && "users" in fetcher.data ? fetcher.data : null;
	const timestamp = usersData && "timestamp" in usersData ? usersData.timestamp : undefined;

	// Auto-load when tab becomes active and data doesn't exist
	useEffect(() => {
		if (isActive && !hasData && !isLoading) {
			fetcher.submit(
				{ actionType: "fetchUsers" },
				{ method: "post" }
			);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isActive]);

	const handleLoadUsers = () => {
		setRefreshCount((prev) => prev + 1);
		fetcher.submit(
			{ actionType: "fetchUsers" },
			{ method: "post" }
		);
	};

	return (
		<div className="border rounded-lg p-6 bg-white shadow-sm">
			<div className="flex items-center justify-between mb-4">
				<div>
					<h2 className="text-2xl font-bold">Users Dashboard</h2>
					<p className="text-sm text-gray-600">
						Load users on-demand with streaming
					</p>
				</div>
				<button
					onClick={handleLoadUsers}
					disabled={isLoading}
					className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
					title={hasData ? "Refresh to fetch new records" : "Load users"}
				>
					{isLoading ? "Loading..." : hasData ? "🔄 Refresh" : "Load Users"}
				</button>
			</div>

			{usersData && usersData.users && (
				<Suspense fallback={<div className="text-gray-500">Streaming users...</div>}>
					<Await resolve={usersData.users}>
						{(users: UsersResponse) => (
							<div className="space-y-4">
								<div className="flex items-center justify-between">
									<p className="text-sm text-gray-600">
										Loaded {users.total} users (Refresh #{refreshCount})
									</p>
									{timestamp && (
										<p className="text-xs text-gray-400">
											Loaded at: {new Date(timestamp).toLocaleTimeString()}
										</p>
									)}
								</div>
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
														{user.firstName} {user.lastName}
													</h3>
													<p className="text-sm text-gray-600">{user.email}</p>
												</div>
											</div>
											<div className="text-sm space-y-1">
												<p>
													<span className="font-medium">Age:</span> {user.age}
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
				</Suspense>
			)}

			{!hasData && !isLoading && (
				<div className="text-center py-8 text-gray-400">
					{isActive ? "Loading data automatically..." : "Switch to this tab to load data"}
				</div>
			)}
		</div>
	);
}

/**
 * Combined Dashboard Section
 * Demonstrates loading both products and users in parallel
 */
function CombinedDashboardSection({ isActive }: { isActive: boolean }) {
	const fetcher = useFetcher<typeof action>();
	const [refreshCount, setRefreshCount] = useState(0);

	const isLoading = fetcher.state === "loading" || fetcher.state === "submitting";
	const hasData = fetcher.data && "products" in fetcher.data && "users" in fetcher.data;
	const combinedData = fetcher.data && "products" in fetcher.data && "users" in fetcher.data ? fetcher.data : null;
	const timestamp = combinedData && "timestamp" in combinedData ? combinedData.timestamp : undefined;
	const productsPromise = combinedData?.products as Promise<ProductsResponse> | undefined;
	const usersPromise = combinedData?.users as Promise<UsersResponse> | undefined;

	// Auto-load when tab becomes active and data doesn't exist
	useEffect(() => {
		if (isActive && !hasData && !isLoading) {
			fetcher.submit(
				{ actionType: "fetchBoth", delayTime: "1000" },
				{ method: "post" }
			);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isActive]);

	const handleLoadBoth = () => {
		setRefreshCount((prev) => prev + 1);
		fetcher.submit(
			{ actionType: "fetchBoth", delayTime: "1000" },
			{ method: "post" }
		);
	};

	return (
		<div className="border rounded-lg p-6 bg-white shadow-sm">
			<div className="flex items-center justify-between mb-4">
				<div>
					<h2 className="text-2xl font-bold">Combined Dashboard</h2>
					<p className="text-sm text-gray-600">
						Load both products and users in parallel - watch them stream in independently!
					</p>
				</div>
				<button
					onClick={handleLoadBoth}
					disabled={isLoading}
					className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
					title={hasData ? "Refresh to fetch new records" : "Load both datasets"}
				>
					{isLoading ? "Loading..." : hasData ? "🔄 Refresh" : "Load Both"}
				</button>
			</div>

			{productsPromise && usersPromise && (
				<div className="space-y-6">
						{/* Products Section */}
						<div>
							<h3 className="text-lg font-semibold mb-2">Products</h3>
							<Suspense fallback={<div className="text-gray-500">Streaming products...</div>}>
								<Await resolve={productsPromise}>
									{(products) => (
									<div className="space-y-2">
										<p className="text-sm text-gray-600">
											✓ Loaded {products.total} products
										</p>
										<div className="grid grid-cols-2 md:grid-cols-4 gap-2">
											{products.products.slice(0, 4).map((product) => (
												<div
													key={product.id}
													className="border rounded p-2 text-sm"
												>
													<img
														src={product.thumbnail}
														alt={product.title}
														className="w-full h-24 object-cover rounded mb-1"
													/>
													<p className="font-medium truncate">{product.title}</p>
													<p className="text-blue-600">${product.price}</p>
												</div>
											))}
										</div>
									</div>
								)}
							</Await>
						</Suspense>
					</div>

						{/* Users Section */}
						<div>
							<h3 className="text-lg font-semibold mb-2">Users</h3>
							<Suspense fallback={<div className="text-gray-500">Streaming users...</div>}>
								<Await resolve={usersPromise}>
									{(users) => (
									<div className="space-y-2">
										<p className="text-sm text-gray-600">
											✓ Loaded {users.total} users
										</p>
										<div className="grid grid-cols-2 md:grid-cols-4 gap-2">
											{users.users.slice(0, 4).map((user) => (
												<div
													key={user.id}
													className="border rounded p-2 text-sm"
												>
													<div className="flex items-center gap-2 mb-1">
														<img
															src={user.image}
															alt={`${user.firstName} ${user.lastName}`}
															className="w-8 h-8 rounded-full object-cover"
														/>
														<div className="min-w-0">
															<p className="font-medium truncate">
																{user.firstName} {user.lastName}
															</p>
														</div>
													</div>
													<p className="text-xs text-gray-600 truncate">{user.email}</p>
												</div>
											))}
										</div>
									</div>
								)}
							</Await>
						</Suspense>
					</div>

					{timestamp && (
						<p className="text-xs text-gray-400 text-center">
							Loaded at: {new Date(timestamp).toLocaleTimeString()} (Refresh #{refreshCount})
						</p>
					)}
				</div>
			)}

			{!hasData && !isLoading && (
				<div className="text-center py-8 text-gray-400">
					{isActive ? "Loading data automatically..." : "Switch to this tab to load data"}
				</div>
			)}
		</div>
	);
}

/**
 * Multiple Independent Fetchers Demo
 * Shows how different sections can load independently
 */
function IndependentFetchersDemo({ isActive }: { isActive: boolean }) {
	const productsFetcher = useFetcher<typeof action>();
	const usersFetcher = useFetcher<typeof action>();
	const analyticsFetcher = useFetcher<typeof action>();

	const hasProductsData = productsFetcher.data && "products" in productsFetcher.data;
	const hasUsersData = usersFetcher.data && "users" in usersFetcher.data;
	const hasAnalyticsData = analyticsFetcher.data && "products" in analyticsFetcher.data;

	// Auto-load all when tab becomes active (if not already loaded)
	useEffect(() => {
		if (isActive) {
			if (!hasProductsData && productsFetcher.state !== "loading" && productsFetcher.state !== "submitting") {
				productsFetcher.submit(
					{ actionType: "fetchProducts", delayTime: "1500" },
					{ method: "post" }
				);
			}
			if (!hasUsersData && usersFetcher.state !== "loading" && usersFetcher.state !== "submitting") {
				usersFetcher.submit(
					{ actionType: "fetchUsers" },
					{ method: "post" }
				);
			}
			if (!hasAnalyticsData && analyticsFetcher.state !== "loading" && analyticsFetcher.state !== "submitting") {
				analyticsFetcher.submit(
					{ actionType: "fetchProducts", delayTime: "3000" },
					{ method: "post" }
				);
			}
		}
	}, [isActive]);

	return (
		<div className="border rounded-lg p-6 bg-gradient-to-br from-blue-50 to-purple-50">
			<h2 className="text-2xl font-bold mb-4">Independent Fetchers Demo</h2>
			<p className="text-sm text-gray-600 mb-4">
				Each section uses its own useFetcher - they can load independently without affecting each other!
			</p>

			<div className="grid md:grid-cols-3 gap-4">
				{/* Products Fetcher */}
				<div className="bg-white rounded-lg p-4 border">
					<div className="flex items-center justify-between mb-2">
						<h3 className="font-semibold">Products</h3>
						<button
							onClick={() =>
								productsFetcher.submit(
									{ actionType: "fetchProducts", delayTime: "1500" },
									{ method: "post" }
								)
							}
							disabled={productsFetcher.state === "loading" || productsFetcher.state === "submitting"}
							className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
							title={hasProductsData ? "Refresh to fetch new records" : "Load products"}
						>
							{productsFetcher.state === "loading" || productsFetcher.state === "submitting"
								? "Loading..."
								: hasProductsData
									? "🔄"
									: "Load"}
						</button>
					</div>
					{productsFetcher.data && "products" in productsFetcher.data && (
						<Suspense fallback={<div className="text-xs text-gray-500">Loading...</div>}>
							<Await resolve={productsFetcher.data.products}>
								{(products: ProductsResponse) => (
									<p className="text-xs text-green-600">✓ {products.total} products</p>
								)}
							</Await>
						</Suspense>
					)}
					{!productsFetcher.data && (
						<p className="text-xs text-gray-400">Not loaded</p>
					)}
				</div>

				{/* Users Fetcher */}
				<div className="bg-white rounded-lg p-4 border">
					<div className="flex items-center justify-between mb-2">
						<h3 className="font-semibold">Users</h3>
						<button
							onClick={() =>
								usersFetcher.submit(
									{ actionType: "fetchUsers" },
									{ method: "post" }
								)
							}
							disabled={usersFetcher.state === "loading" || usersFetcher.state === "submitting"}
							className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400"
							title={hasUsersData ? "Refresh to fetch new records" : "Load users"}
						>
							{usersFetcher.state === "loading" || usersFetcher.state === "submitting"
								? "Loading..."
								: hasUsersData
									? "🔄"
									: "Load"}
						</button>
					</div>
					{usersFetcher.data && "users" in usersFetcher.data && (
						<Suspense fallback={<div className="text-xs text-gray-500">Loading...</div>}>
							<Await resolve={usersFetcher.data.users}>
								{(users: UsersResponse) => (
									<p className="text-xs text-green-600">✓ {users.total} users</p>
								)}
							</Await>
						</Suspense>
					)}
					{!usersFetcher.data && (
						<p className="text-xs text-gray-400">Not loaded</p>
					)}
				</div>

				{/* Analytics Fetcher (using products as example) */}
				<div className="bg-white rounded-lg p-4 border">
					<div className="flex items-center justify-between mb-2">
						<h3 className="font-semibold">Analytics</h3>
						<button
							onClick={() =>
								analyticsFetcher.submit(
									{ actionType: "fetchProducts", delayTime: "3000" },
									{ method: "post" }
								)
							}
							disabled={analyticsFetcher.state === "loading" || analyticsFetcher.state === "submitting"}
							className="px-3 py-1 text-xs bg-purple-600 text-white rounded hover:bg-purple-700 disabled:bg-gray-400"
							title={hasAnalyticsData ? "Refresh to fetch new records" : "Load analytics"}
						>
							{analyticsFetcher.state === "loading" || analyticsFetcher.state === "submitting"
								? "Loading..."
								: hasAnalyticsData
									? "🔄"
									: "Load"}
						</button>
					</div>
					{analyticsFetcher.data && "products" in analyticsFetcher.data && (
						<Suspense fallback={<div className="text-xs text-gray-500">Loading...</div>}>
							<Await resolve={analyticsFetcher.data.products}>
								{(products: ProductsResponse) => (
									<p className="text-xs text-green-600">✓ Analytics ready</p>
								)}
							</Await>
						</Suspense>
					)}
					{!analyticsFetcher.data && (
						<p className="text-xs text-gray-400">Not loaded</p>
					)}
				</div>
			</div>

			<p className="text-xs text-gray-500 mt-4">
				💡 Try loading them in different orders or simultaneously - each fetcher works independently!
			</p>
		</div>
	);
}

export default function UseFetcherDeferDashboard({
	loaderData,
}: Route.ComponentProps) {
	const [activeTab, setActiveTab] = useState<Tab>("independent");

	return (
		<AppLayout>
			<div className="container mx-auto px-4 py-8 space-y-8">
				<div className="text-center mb-8">
					<h1 className="text-4xl font-bold mb-2">
						useFetcher + Defer Dashboard Demo
					</h1>
					<p className="text-gray-600">
						Powerful streaming dashboards with on-demand data loading
					</p>
				</div>

				{/* Tabs Navigation */}
				<Tabs activeTab={activeTab} onTabChange={setActiveTab} />

				{/* Tab Content - Keep all tabs mounted to prevent stream abort errors */}
				<div className="min-h-[400px] relative">
					<div className={activeTab === "independent" ? "block" : "hidden"}>
						<IndependentFetchersDemo isActive={activeTab === "independent"} />
					</div>
					<div className={activeTab === "products" ? "block" : "hidden"}>
						<ProductsDashboardSection isActive={activeTab === "products"} />
					</div>
					<div className={activeTab === "users" ? "block" : "hidden"}>
						<UsersDashboardSection isActive={activeTab === "users"} />
					</div>
					<div className={activeTab === "combined" ? "block" : "hidden"}>
						<CombinedDashboardSection isActive={activeTab === "combined"} />
					</div>
					{activeTab === "docs" && (
						<section className="p-6 bg-gray-50 rounded-lg">
							<h2 className="text-xl font-bold mb-4">How useFetcher + Defer Works</h2>
							<div className="space-y-3 text-sm">
								<div>
									<strong className="text-blue-600">1. On-Demand Loading:</strong>
									<p className="text-gray-700 ml-4">
										Unlike loader-based defer (which loads on page navigation), useFetcher allows you to
										trigger data fetching on user actions (button clicks, filter changes, etc.).
									</p>
								</div>
								<div>
									<strong className="text-green-600">2. Streaming Benefits:</strong>
									<p className="text-gray-700 ml-4">
										Even though data is fetched on-demand, you still get streaming benefits with defer().
										The data streams in progressively, showing loading states and then the final result.
									</p>
								</div>
								<div>
									<strong className="text-purple-600">3. Independent Fetchers:</strong>
									<p className="text-gray-700 ml-4">
										Each useFetcher instance is independent. You can have multiple fetchers running
										simultaneously, each managing its own state and streaming its own data.
									</p>
								</div>
								<div>
									<strong className="text-orange-600">4. Perfect for Dashboards:</strong>
									<p className="text-gray-700 ml-4">
										This pattern is ideal for dashboards where different sections can load independently,
										users can refresh specific sections, and you want progressive loading without blocking
										the UI.
									</p>
								</div>
								<div className="mt-4 p-4 bg-blue-100 rounded border-l-4 border-blue-500">
									<strong>Key Advantages:</strong>
									<ul className="list-disc list-inside mt-2 space-y-1 text-gray-700">
										<li>No page navigation required - fetch data without leaving the page</li>
										<li>Multiple independent data streams</li>
										<li>Progressive loading with Suspense boundaries</li>
										<li>Better UX - users see loading states and data streams in</li>
										<li>Can refresh individual sections without affecting others</li>
									</ul>
								</div>
								<div className="mt-6 p-4 bg-green-50 rounded border-l-4 border-green-500">
									<strong className="text-green-700">Code Example:</strong>
									<pre className="mt-2 p-3 bg-gray-800 text-green-400 rounded text-xs overflow-x-auto">
										<code>{`const fetcher = useFetcher<typeof action>();

// Trigger fetch on button click
fetcher.submit(
  { actionType: "fetchProducts" },
  { method: "post" }
);

// Use deferred data with streaming
{fetcher.data && "products" in fetcher.data && (
  <Suspense fallback={<div>Loading...</div>}>
    <Await resolve={fetcher.data.products}>
      {(products) => <ProductsList products={products} />}
    </Await>
  </Suspense>
)}`}</code>
									</pre>
								</div>
							</div>
						</section>
					)}
				</div>
			</div>
		</AppLayout>
	);
}

