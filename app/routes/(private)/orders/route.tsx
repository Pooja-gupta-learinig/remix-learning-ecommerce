import type { LoaderFunctionArgs } from "react-router";
import { useLoaderData, Link, useSearchParams } from "react-router";
import { requireUserSession } from "~/sessions.server";
import { getOrdersByUserId } from "~/lib/orders.server";
import { AppLayout } from "~/layouts/AppLayouts";
import type { OrderStatus } from "~/lib/orders";
import { useEffect, useState } from "react";

export async function loader({ request }: LoaderFunctionArgs) {
	const user = await requireUserSession(request);
	const orders = await getOrdersByUserId(user.id);
	const url = new URL(request.url);
	const success = url.searchParams.get("success") === "true";
	return { orders, success };
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

export default function Orders() {
	const { orders, success } = useLoaderData<typeof loader>();
	const [searchParams, setSearchParams] = useSearchParams();
	const [showSuccess, setShowSuccess] = useState(success);

	useEffect(() => {
		if (success) {
			// Remove success param from URL
			const newParams = new URLSearchParams(searchParams);
			newParams.delete("success");
			setSearchParams(newParams, { replace: true });
		}
	}, [success, searchParams, setSearchParams]);

	return (
		<AppLayout>
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				<div className="mb-6">
					<h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
				</div>

				{showSuccess && (
					<div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
						<div className="flex items-center gap-3">
							<svg
								className="w-6 h-6 text-green-600 shrink-0"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
								/>
							</svg>
							<div className="flex-1">
								<p className="text-green-800 font-semibold">Order created successfully!</p>
								<p className="text-green-700 text-sm mt-1">
									Your order has been placed and will be processed shortly.
								</p>
							</div>
							<button
								onClick={() => setShowSuccess(false)}
								className="text-green-600 hover:text-green-800 transition-colors"
								aria-label="Dismiss success message"
							>
								<svg
									className="w-5 h-5"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M6 18L18 6M6 6l12 12"
									/>
								</svg>
							</button>
						</div>
					</div>
				)}

				{orders.length === 0 ? (
					<div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
						<p className="text-gray-500 mb-4">You haven't placed any orders yet.</p>
						<Link
							to="/products"
							prefetch="intent"
							className="inline-block bg-gray-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors"
						>
							Start Shopping
						</Link>
					</div>
				) : (
					<div className="space-y-4">
						{orders.map((order) => (
							<Link
								key={order.id}
								to={`/orders/${order.id}`}
								prefetch="intent"
								className="block bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow"
							>
								<div className="flex items-center justify-between">
									<div className="flex-1">
										<div className="flex items-center gap-4 mb-2">
											<p className="text-sm font-medium text-gray-500">Order #{order.id.slice(0, 8)}</p>
											<span
												className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
													order.status
												)}`}
											>
												{order.status && order.status.length > 0 ? order.status.charAt(0).toUpperCase() + order.status.slice(1) : "Unknown"}
											</span>
										</div>
										<p className="text-sm text-gray-500">
											{new Date(order.createdAt).toLocaleDateString("en-US", {
												year: "numeric",
												month: "long",
												day: "numeric",
											})}
										</p>
										<p className="text-sm text-gray-600 mt-1">
											{order.totalItems} {order.totalItems === 1 ? "item" : "items"}
										</p>
									</div>
									<div className="text-right">
										<p className="text-lg font-bold text-gray-900">
											${order.totalPrice.toFixed(2)}
										</p>
										<p className="text-sm text-gray-500 mt-1">View Details →</p>
									</div>
								</div>
							</Link>
						))}
					</div>
				)}
			</div>
		</AppLayout>
	);
}

