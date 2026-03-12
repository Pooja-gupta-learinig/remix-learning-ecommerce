import type { Route } from "./+types/admin.orders";
import { useLoaderData, Link } from "react-router";
import { adminLoader } from "~/lib/admin.server";
import { getAllOrders, updateOrderStatus } from "~/lib/orders.server";
import { orderStatuses, type OrderStatus } from "~/lib/orders";
import { Form, useNavigation } from "react-router";
import { redirect } from "@remix-run/node";

export async function loader({ request }: Route.LoaderArgs) {
	await adminLoader(request);
	const orders = await getAllOrders();
	return { orders };
}

export async function action({ request }: Route.ActionArgs) {
	await adminLoader(request);
	const formData = await request.formData();
	const orderId = formData.get("orderId")?.toString();
	const status = formData.get("status")?.toString() as OrderStatus | undefined;

	if (!orderId || !status || !orderStatuses.includes(status)) {
		return {
			error: "Invalid order ID or status",
		};
	}

	await updateOrderStatus(orderId, status);
	return redirect("/admin/orders");
}

function getStatusColor(status: OrderStatus): string {
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

export default function AdminOrders() {
	const { orders } = useLoaderData<typeof loader>();
	const navigation = useNavigation();

	return (
		<div className="max-w-7xl mx-auto">
			{/* Header */}
			<div className="mb-6">
				<h1 className="text-3xl font-bold text-gray-900">Order Management</h1>
				<p className="mt-2 text-sm text-gray-600">
					View and update order statuses
				</p>
			</div>

				{orders.length === 0 ? (
					<div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
						<p className="text-gray-500">No orders found.</p>
					</div>
				) : (
					<div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
						<div className="overflow-x-auto">
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
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
											Actions
										</th>
									</tr>
								</thead>
								<tbody className="bg-white divide-y divide-gray-200">
									{orders.map((order) => (
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
												<div className="text-sm text-gray-900">{order.userEmail}</div>
											</td>
											<td className="px-6 py-4 whitespace-nowrap">
												<div className="text-sm text-gray-900">{order.totalItems}</div>
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
												{order.status && order.status.length > 0 ? order.status.charAt(0).toUpperCase() + order.status.slice(1) : "Unknown"}
											</span>
											</td>
											<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
												{new Date(order.createdAt).toLocaleDateString("en-US", {
													year: "numeric",
													month: "short",
													day: "numeric",
												})}
											</td>
											<td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
												<Form method="post" className="inline-block">
													<input type="hidden" name="orderId" value={order.id} />
													<select
														name="status"
														defaultValue={order.status}
														onChange={(e) => {
															if (e.target.value !== order.status) {
																e.target.form?.requestSubmit();
															}
														}}
														disabled={navigation.state !== "idle"}
														className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 outline-none disabled:opacity-50 disabled:cursor-not-allowed"
													>
														{orderStatuses.map((status) => (
															<option key={status} value={status}>
																{status && status.length > 0 ? status.charAt(0).toUpperCase() + status.slice(1) : "Unknown"}
															</option>
														))}
													</select>
												</Form>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</div>
				)}
		</div>
	);
}

