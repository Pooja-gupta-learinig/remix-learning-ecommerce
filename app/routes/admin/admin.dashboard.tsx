import type { Route } from "./+types/admin.dashboard";
import { useLoaderData, Link } from "react-router";
import { adminLoader, getDashboardStats } from "~/lib/admin.server";
import {
	ShoppingCart,
	DollarSign,
	Package,
	Clock,
	Users,
	ArrowRight,
	Plus,
	List,
} from "lucide-react";
import type { Order } from "~/lib/orders.server";

export async function loader({ request }: Route.LoaderArgs) {
	await adminLoader(request);
	const stats = await getDashboardStats();

	return { stats };
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

export default function AdminDashboard() {
	const { stats } = useLoaderData<typeof loader>();

	return (
		<div className="max-w-7xl mx-auto">
			{/* Header */}
			<div className="mb-8">
				<h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
				<p className="mt-2 text-sm text-gray-600">
					Overview of your e-commerce store
				</p>
			</div>

			{/* Statistics Cards */}
			<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
				{/* Total Orders Card */}
				<div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm font-medium text-gray-600">Total Orders</p>
							<p className="mt-2 text-3xl font-bold text-gray-900">
								{stats.totalOrders}
							</p>
						</div>
						<div className="p-3 bg-blue-100 rounded-lg">
							<ShoppingCart className="w-6 h-6 text-blue-600" />
						</div>
					</div>
				</div>

				{/* Total Revenue Card */}
				<div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm font-medium text-gray-600">
								Total Revenue
							</p>
							<p className="mt-2 text-3xl font-bold text-gray-900">
								${stats.totalRevenue.toFixed(2)}
							</p>
						</div>
						<div className="p-3 bg-green-100 rounded-lg">
							<DollarSign className="w-6 h-6 text-green-600" />
						</div>
					</div>
				</div>

				{/* Total Products Card */}
				<div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm font-medium text-gray-600">
								Total Products
							</p>
							<p className="mt-2 text-3xl font-bold text-gray-900">
								{stats.totalProducts}
							</p>
						</div>
						<div className="p-3 bg-purple-100 rounded-lg">
							<Package className="w-6 h-6 text-purple-600" />
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
								{stats.pendingOrders}
							</p>
						</div>
						<div className="p-3 bg-yellow-100 rounded-lg">
							<Clock className="w-6 h-6 text-yellow-600" />
						</div>
					</div>
				</div>
			</div>

			{/* Quick Actions */}
			<div className="mb-8">
				<h2 className="text-xl font-semibold text-gray-900 mb-4">
					Quick Actions
				</h2>
				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
					<Link
						to="/admin/products/addeditproduct"
						className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow group"
					>
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-4">
								<div className="p-3 bg-indigo-100 rounded-lg group-hover:bg-indigo-200 transition-colors">
									<Plus className="w-5 h-5 text-indigo-600" />
								</div>
								<div>
									<h3 className="font-semibold text-gray-900">Add Product</h3>
									<p className="text-sm text-gray-600">Create a new product</p>
								</div>
							</div>
							<ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-indigo-600 transition-colors" />
						</div>
					</Link>

					<Link
						to="/admin/orders"
						className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow group"
					>
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-4">
								<div className="p-3 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
									<List className="w-5 h-5 text-blue-600" />
								</div>
								<div>
									<h3 className="font-semibold text-gray-900">
										Manage Orders
									</h3>
									<p className="text-sm text-gray-600">View and update orders</p>
								</div>
							</div>
							<ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
						</div>
					</Link>

					<Link
						to="/admin/products"
						className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow group"
					>
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-4">
								<div className="p-3 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
									<Package className="w-5 h-5 text-purple-600" />
								</div>
								<div>
									<h3 className="font-semibold text-gray-900">
										Manage Products
									</h3>
									<p className="text-sm text-gray-600">View all products</p>
								</div>
							</div>
							<ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-purple-600 transition-colors" />
						</div>
					</Link>
				</div>
			</div>

			{/* Recent Orders */}
			<div className="bg-white rounded-xl border border-gray-200 shadow-sm">
				<div className="px-6 py-4 border-b border-gray-200">
					<div className="flex items-center justify-between">
						<h2 className="text-xl font-semibold text-gray-900">
							Recent Orders
						</h2>
						<Link
							to="/admin/orders"
							className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
						>
							View all →
						</Link>
					</div>
				</div>
				<div className="overflow-x-auto">
					{stats.recentOrders.length === 0 ? (
						<div className="p-12 text-center">
							<p className="text-gray-500">No recent orders found.</p>
						</div>
					) : (
						<table className="min-w-full divide-y divide-gray-200">
							<thead className="bg-gray-50">
								<tr>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Order ID
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Customer
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
								{stats.recentOrders.map((order: Order) => (
									<tr key={order.id} className="hover:bg-gray-50">
										<td className="px-6 py-4 whitespace-nowrap">
											<Link
												to={`/orders/${order.id}`}
												className="text-sm font-medium text-indigo-600 hover:text-indigo-900"
											>
												{order.id.slice(0, 8)}...
											</Link>
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<div className="text-sm text-gray-900">
												{order.userEmail}
											</div>
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
												{order.status.charAt(0).toUpperCase() +
													order.status.slice(1)}
											</span>
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
											{new Date(order.createdAt).toLocaleDateString("en-US", {
												year: "numeric",
												month: "short",
												day: "numeric",
											})}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					)}
				</div>
			</div>
		</div>
	);
}
