
import type { Route } from "./+types/dashboard";
import { useLoaderData, Link, Await, Outlet } from "react-router";
import { Suspense } from "react";
import { requireUserSession } from "~/sessions.server";
import { getOrdersByUserId } from "~/lib/orders.server";
import { AppLayout } from "~/layouts/AppLayouts";
import {
	ShoppingCart,
	DollarSign,
	Clock,
	Package,
	ArrowRight,
	User,
} from "lucide-react";
import type { Order } from "~/lib/orders.server";
import { DashboardStatsSkeleton, OrdersListSkeleton } from "~/components/common/Skeleton";


/**
 * Helper function to create deferred data structure for React Router v7
 * This allows promises to be streamed in after initial render
 */
function defer<T extends Record<string, unknown>>(data: T): T {
	return data;
}

/**
 * Wrapper to add timeout to a promise
 */
function withTimeout<T>(promise: Promise<T>, timeoutMs: number, fallback: T): Promise<T> {
	return Promise.race([
		promise,
		new Promise<T>((resolve) => {
			setTimeout(() => {
				console.warn(`[withTimeout] Operation timed out after ${timeoutMs}ms, using fallback`);
				resolve(fallback);
			}, timeoutMs);
		}),
	]);
}

export async function loader({ request }: Route.LoaderArgs) {
	const user = await requireUserSession(request);
	
	// Defer orders data (can be slower, stream in)
	// Add timeout (25 seconds) to prevent 504 errors, with error handling
	const ordersPromise = withTimeout(
		getOrdersByUserId(user.id).catch((error) => {
			console.error("[dashboard loader] Error loading orders:", error);
			// Return empty array on error instead of throwing
			return [] as Order[];
		}),
		25000, // 25 seconds timeout (less than Vercel's 30s limit)
		[] as Order[] // Fallback to empty array on timeout
	);

	return defer({
		user,
		orders: ordersPromise,
	});
}

function DashboardStats({ ordersPromise }: { ordersPromise: Promise<Order[]> }) {
	return (
		<Await resolve={ordersPromise} errorElement={<div className="text-red-600 p-4">Failed to load statistics. Please try refreshing the page.</div>}>
			{(orders) => {
				// Calculate user-specific stats
				const totalOrders = orders.length;
				const totalSpent = orders.reduce((sum, order) => sum + order.totalPrice, 0);
				const pendingOrders = orders.filter((o) => o.status === "pending").length;

				return (
					<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-8">
						{/* Total Orders Card */}
						<div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm font-medium text-gray-600">
										Total Orders
									</p>
									<p className="mt-2 text-3xl font-bold text-gray-900">
										{totalOrders}
									</p>
								</div>
								<div className="p-3 bg-blue-100 rounded-lg">
									<ShoppingCart className="w-6 h-6 text-blue-600" />
								</div>
							</div>
						</div>

						{/* Total Spent Card */}
						<div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm font-medium text-gray-600">
										Total Spent
									</p>
									<p className="mt-2 text-3xl font-bold text-gray-900">
										${totalSpent.toFixed(2)}
									</p>
								</div>
								<div className="p-3 bg-green-100 rounded-lg">
									<DollarSign className="w-6 h-6 text-green-600" />
								</div>
							</div>
						</div>

						{/* Pending Orders Card */}
						<div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm font-medium text-gray-600">
										Pending Orders
									</p>
									<p className="mt-2 text-3xl font-bold text-gray-900">
										{pendingOrders}
									</p>
								</div>
								<div className="p-3 bg-yellow-100 rounded-lg">
									<Clock className="w-6 h-6 text-yellow-600" />
								</div>
							</div>
						</div>
					</div>
				);
			}}
		</Await>
	);
}

function RecentOrders({ ordersPromise }: { ordersPromise: Promise<Order[]> }) {
	return (
		<Await resolve={ordersPromise} errorElement={<div className="text-red-600 p-4">Failed to load recent orders. Please try refreshing the page.</div>}>
			{(orders) => {
				const recentOrders = orders.slice(0, 5);

				return (
					<div className="bg-white rounded-xl border border-gray-200 shadow-sm">
						<div className="px-6 py-4 border-b border-gray-200">
							<div className="flex items-center justify-between">
								<h2 className="text-xl font-semibold text-gray-900">
									Recent Orders
								</h2>
								<Link
									to="/orders"
									prefetch="intent"
									className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
								>
									View all →
								</Link>
							</div>
						</div>
						<div className="overflow-x-auto">
							{recentOrders.length === 0 ? (
								<div className="p-12 text-center">
									<p className="text-gray-500 mb-4">
										You haven't placed any orders yet.
									</p>
									<Link
										to="/products"
										prefetch="intent"
										className="inline-block bg-gray-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors"
									>
										Start Shopping
									</Link>
								</div>
							) : (
								<table className="min-w-full divide-y divide-gray-200">
									<thead className="bg-gray-50">
										<tr>
											<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
												Order ID
											</th>
											<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
												Items
											</th>
											<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
												Total
											</th>
											<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
												Status
											</th>
											<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
												Date
											</th>
										</tr>
									</thead>
									<tbody className="bg-white divide-y divide-gray-200">
										{recentOrders.map((order: Order) => (
											<tr key={order.id} className="hover:bg-gray-50">
												<td className="px-6 py-4 whitespace-nowrap">
													<Link
														to={`/orders/${order.id}`}
														prefetch="intent"
														className="text-sm font-medium text-indigo-600 hover:text-indigo-900"
													>
														{order.id.slice(0, 8)}...
													</Link>
												</td>
												<td className="px-6 py-4 whitespace-nowrap">
													<div className="text-sm text-gray-900">
														{order.totalItems}
													</div>
												</td>
												<td className="px-6 py-4 whitespace-nowrap">
													<div className="text-sm font-medium text-gray-900">
														${order.totalPrice.toFixed(2)}
													</div>
												</td>
												<td className="px-6 py-4 whitespace-nowrap">
													<span
														className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
															order.status
														)}`}
													>
														{order.status && order.status.length > 0 ? order.status.charAt(0).toUpperCase() +
															order.status.slice(1) : "Unknown"}
													</span>
												</td>
												<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
													{new Date(order.createdAt).toLocaleDateString(
														"en-US",
														{
															year: "numeric",
															month: "short",
															day: "numeric",
														}
													)}
												</td>
											</tr>
										))}
									</tbody>
								</table>
							)}
						</div>
					</div>
				);
			}}
		</Await>
	);
}

function getStatusColor(status: string): string {
	switch (status) {
		case "pending":
			return "bg-yellow-100 text-yellow-800";
		case "processing":
			return "bg-blue-100 text-blue-800";
		case "shipped":
			return "bg-purple-100 text-purple-800";
		case "delivered":
			return "bg-green-100 text-green-800";
		case "cancelled":
			return "bg-red-100 text-red-800";
		default:
			return "bg-gray-100 text-gray-800";
	}
}

export default function DashboardPage() {
	const { user, orders } = useLoaderData<typeof loader>();

	return (
		<AppLayout>
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				{/* Header */}
				<div className="mb-8">
					<h1 className="text-3xl font-bold text-gray-900">My Dashboard</h1>
					<p className="mt-2 text-sm text-gray-600">
						Welcome back, {user.email}
					</p>
				</div>

				{/* Statistics Cards */}
				<Suspense fallback={<DashboardStatsSkeleton />}>
					<DashboardStats ordersPromise={orders} />
				</Suspense>

				{/* Quick Actions */}
				<div className="mb-8">
					<h2 className="text-xl font-semibold text-gray-900 mb-4">
						Quick Actions
					</h2>
					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
						<Link
							to="/orders"
							prefetch="intent"
							className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow group"
						>
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-4">
									<div className="p-3 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
										<ShoppingCart className="w-5 h-5 text-blue-600" />
									</div>
									<div>
										<h3 className="font-semibold text-gray-900">
											My Orders
										</h3>
										<p className="text-sm text-gray-600">
											View all your orders
										</p>
									</div>
								</div>
								<ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
							</div>
						</Link>

						<Link
							to="/products"
							prefetch="intent"
							className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow group"
						>
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-4">
									<div className="p-3 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
										<Package className="w-5 h-5 text-purple-600" />
									</div>
									<div>
										<h3 className="font-semibold text-gray-900">
											Browse Products
										</h3>
										<p className="text-sm text-gray-600">
											Shop our collection
										</p>
									</div>
								</div>
								<ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-purple-600 transition-colors" />
							</div>
						</Link>

						<Link
							to="/dashboard/settings"
							prefetch="intent"
							className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow group"
						>
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-4">
									<div className="p-3 bg-indigo-100 rounded-lg group-hover:bg-indigo-200 transition-colors">
										<User className="w-5 h-5 text-indigo-600" />
									</div>
									<div>
										<h3 className="font-semibold text-gray-900">
											Account Settings
										</h3>
										<p className="text-sm text-gray-600">
											Manage your account
										</p>
									</div>
								</div>
								<ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-indigo-600 transition-colors" />
							</div>
						</Link>
					</div>
				</div>

				{/* Recent Orders */}
				<Suspense fallback={<OrdersListSkeleton />}>
					<RecentOrders ordersPromise={orders} />
				</Suspense>
				<Outlet />
			</div>
		</AppLayout>
	);
}