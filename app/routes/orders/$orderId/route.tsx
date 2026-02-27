import { useLoaderData, Link } from "react-router";
import type { LoaderFunctionArgs } from "react-router";
import { redirect } from "@remix-run/node";
import { requireUserSession } from "~/sessions.server";
import { getOrderById } from "~/lib/orders.server";
import { AppLayout } from "~/layouts/AppLayouts";
import type { OrderStatus } from "~/lib/orders";

export async function loader({ request, params }: LoaderFunctionArgs) {
	const user = await requireUserSession(request);
	const { orderId } = params;

	if (!orderId) {
		throw redirect("/dashboard");
	}

	const order = await getOrderById(orderId);

	if (!order) {
		throw new Response("Order not found", { status: 404 });
	}

	// Users can only view their own orders (unless admin)
	if (order.userId !== user.id && user.role !== "admin") {
		throw new Response("Unauthorized", { status: 403 });
	}

	return {
		order,
		user,
	};
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

export default function OrderDetails() {
	const { order, user } = useLoaderData<typeof loader>();

	return (
		<AppLayout>
			<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				<div className="flex items-center justify-between mb-8">
					<h1 className="text-3xl font-bold text-gray-900">Order Details</h1>
					<Link
						to={user.role === "admin" ? "/admin/orders" : "/orders"}
						className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
					>
						← Back to Orders
					</Link>
				</div>

				{/* Order Status */}
				<div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm mb-6">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm text-gray-500">Order ID</p>
							<p className="text-lg font-semibold text-gray-900">{order.id}</p>
						</div>
						<div className="text-right">
							<p className="text-sm text-gray-500">Status</p>
							<span
								className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
									order.status
								)}`}
							>
								{order.status.charAt(0).toUpperCase() + order.status.slice(1)}
							</span>
						</div>
					</div>
					<div className="mt-4 pt-4 border-t border-gray-200">
						<p className="text-sm text-gray-500">Placed on</p>
						<p className="text-gray-900">
							{new Date(order.createdAt).toLocaleDateString("en-US", {
								year: "numeric",
								month: "long",
								day: "numeric",
								hour: "2-digit",
								minute: "2-digit",
							})}
						</p>
					</div>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
					{/* Shipping Address */}
					<div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
						<h2 className="text-lg font-bold text-gray-900 mb-4">Shipping Address</h2>
						<div className="text-gray-600 space-y-1">
							<p className="font-medium text-gray-900">
								{order.shippingAddress.firstName} {order.shippingAddress.lastName}
							</p>
							<p>{order.shippingAddress.address}</p>
							<p>
								{order.shippingAddress.city}, {order.shippingAddress.state}{" "}
								{order.shippingAddress.zipCode}
							</p>
							<p className="text-sm text-gray-500 mt-2">{order.shippingAddress.email}</p>
						</div>
					</div>

					{/* Payment Method */}
					<div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
						<h2 className="text-lg font-bold text-gray-900 mb-4">Payment Method</h2>
						<div className="text-gray-600 space-y-1">
							<p className="font-medium text-gray-900">
								Card ending in {order.paymentInfo.cardNumber.slice(-4)}
							</p>
							<p className="text-sm">Expires: {order.paymentInfo.expiryDate}</p>
						</div>
					</div>
				</div>

				{/* Order Items */}
				<div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm mb-6">
					<h2 className="text-lg font-bold text-gray-900 mb-4">Order Items</h2>
					<div className="space-y-4">
						{order.items.map((item, index) => {
							const itemTotal = item.price * item.quantity;
							return (
								<div key={index} className="flex gap-4 pb-4 border-b border-gray-200 last:border-0">
									<img
										src={item.thumbnail}
										alt={item.title}
										className="w-20 h-20 object-cover rounded-lg"
									/>
									<div className="flex-1 min-w-0">
										<h3 className="text-base font-medium text-gray-900">{item.title}</h3>
										<p className="text-sm text-gray-500 mt-1">
											Quantity: {item.quantity} × ${item.price.toFixed(2)}
										</p>
									</div>
									<div className="text-right">
										<p className="text-base font-semibold text-gray-900">
											${itemTotal.toFixed(2)}
										</p>
									</div>
								</div>
							);
						})}
					</div>
				</div>

				{/* Order Summary */}
				<div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
					<h2 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h2>
					<div className="space-y-3">
						<div className="flex justify-between text-gray-600">
							<span>Items ({order.totalItems})</span>
							<span className="font-medium">${order.totalPrice.toFixed(2)}</span>
						</div>
						<div className="flex justify-between text-gray-600">
							<span>Shipping</span>
							<span className="text-green-600 font-medium">Free</span>
						</div>
						<div className="border-t border-gray-200 pt-3 mt-4">
							<div className="flex justify-between text-lg font-bold text-gray-900">
								<span>Total</span>
								<span>${order.totalPrice.toFixed(2)}</span>
							</div>
						</div>
					</div>
				</div>
			</div>
		</AppLayout>
	);
}

