import { redirect } from "@remix-run/node";
import type { Route } from "./+types/checkout";
import { AppLayout } from "~/layouts/AppLayouts";
import { requireUserSession } from "~/sessions.server";
import { getCart } from "~/lib/cart-session.server";
import { fetchProductById } from "~/lib/product-detail";
import type { Product } from "~/types/product.types";
import { Outlet, useLocation, Link, useLoaderData } from "react-router";

type CheckoutStep = "address" | "payment" | "review";

const steps: { id: CheckoutStep; label: string; path: string }[] = [
	{ id: "address", label: "Address", path: "/checkout/address" },
	{ id: "payment", label: "Payment", path: "/checkout/payment" },
	{ id: "review", label: "Review", path: "/checkout/review" },
];

export async function loader({ request }: Route.LoaderArgs) {
	const user = await requireUserSession(request, "/checkout");
	const url = new URL(request.url);
	
	// If accessing /checkout directly, redirect to address step
	if (url.pathname === "/checkout") {
		throw redirect("/checkout/address");
	}

	const cart = await getCart(request);

	// If cart is empty, redirect to cart page
	if (cart.items.length === 0) {
		throw redirect("/cart");
	}

	// Fetch product details for all cart items
	const cartItemsWithProducts = await Promise.all(
		cart.items.map(async (item) => {
			try {
				const product = await fetchProductById(String(item.productId));
				return {
					...item,
					product,
				};
			} catch (error) {
				console.error(`Failed to fetch product ${item.productId}:`, error);
				return null;
			}
		})
	);

	// Filter out any failed product fetches
	const validItems = cartItemsWithProducts.filter(
		(item): item is { productId: number; quantity: number; product: Product } =>
			item !== null
	);

	// Calculate totals
	const totalItems = validItems.reduce((sum, item) => sum + item.quantity, 0);
	const totalPrice = validItems.reduce((sum, item) => {
		const discountedPrice =
			item.product.price - (item.product.price * item.product.discountPercentage) / 100;
		return sum + discountedPrice * item.quantity;
	}, 0);

	return {
		items: validItems,
		totalItems,
		totalPrice,
	};
}

function getCurrentStep(pathname: string): CheckoutStep {
	if (pathname.includes("/review")) return "review";
	if (pathname.includes("/payment")) return "payment";
	return "address";
}

export default function Checkout() {
	const location = useLocation();
	const currentStep = getCurrentStep(location.pathname);
	const { items, totalItems, totalPrice } = useLoaderData<typeof loader>();

	return (
		<AppLayout>
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				<h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

				{/* Progress Bar */}
				<div className="mb-8">
					<div className="flex items-center justify-between">
						{steps.map((step, index) => {
							const isActive = step.id === currentStep;
							const isCompleted = steps.findIndex((s) => s.id === currentStep) > index;
							const isClickable = isCompleted || isActive;

							return (
								<div key={step.id} className="flex items-center flex-1">
									<div className="flex flex-col items-center flex-1">
										{isClickable ? (
											<Link
												to={step.path}
												className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors ${
													isCompleted
														? "bg-green-600 border-green-600 text-white"
														: isActive
															? "bg-gray-900 border-gray-900 text-white"
															: "bg-white border-gray-300 text-gray-400"
												}`}
											>
												{isCompleted ? (
													<svg
														className="w-6 h-6"
														fill="none"
														stroke="currentColor"
														viewBox="0 0 24 24"
													>
														<path
															strokeLinecap="round"
															strokeLinejoin="round"
															strokeWidth={2}
															d="M5 13l4 4L19 7"
														/>
													</svg>
												) : (
													<span className="font-semibold">{index + 1}</span>
												)}
											</Link>
										) : (
											<div
												className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
													isActive
														? "bg-gray-900 border-gray-900 text-white"
														: "bg-white border-gray-300 text-gray-400"
												}`}
											>
												<span className="font-semibold">{index + 1}</span>
											</div>
										)}
										<span
											className={`mt-2 text-sm font-medium ${
												isActive ? "text-gray-900" : "text-gray-500"
											}`}
										>
											{step.label}
										</span>
									</div>
									{index < steps.length - 1 && (
										<div
											className={`flex-1 h-0.5 mx-4 ${
												isCompleted ? "bg-green-600" : "bg-gray-300"
											}`}
										/>
									)}
								</div>
							);
						})}
					</div>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
					{/* Main Content - Nested Routes */}
					<div className="lg:col-span-2">
						<Outlet />
					</div>

					{/* Order Summary Sidebar */}
					<div className="lg:col-span-1">
						<div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm sticky top-4 flex flex-col h-fit">
							<h2 className="text-xl font-bold text-gray-900 mb-4 shrink-0">Order Summary</h2>

							{/* Scrollable Products List */}
							<div className="max-h-[400px] overflow-y-auto overflow-x-hidden pr-2 scroll-smooth mb-6">
								<div className="space-y-3">
									{items.map((item) => {
										const discountedPrice =
											item.product.price -
											(item.product.price * item.product.discountPercentage) / 100;
										const itemTotal = discountedPrice * item.quantity;

										return (
											<div key={item.productId} className="flex items-start gap-3 pb-3 border-b border-gray-100">
												<img
													src={item.product.thumbnail}
													alt={item.product.title}
													className="w-16 h-16 object-cover rounded-lg"
												/>
												<div className="flex-1 min-w-0">
													<p className="text-sm font-medium text-gray-900 line-clamp-2">
														{item.product.title}
													</p>
													<p className="text-xs text-gray-500 mt-1">
														Qty: {item.quantity} × ${discountedPrice.toFixed(2)}
													</p>
													<p className="text-sm font-semibold text-gray-900 mt-1">
														${itemTotal.toFixed(2)}
													</p>
												</div>
											</div>
										);
									})}
								</div>
							</div>

							{/* Fixed Summary Section */}
							<div className="shrink-0 space-y-3 pt-4 border-t border-gray-200">
								<div className="flex justify-between text-gray-600">
									<span>Items ({totalItems})</span>
									<span className="font-medium">${totalPrice.toFixed(2)}</span>
								</div>
								<div className="flex justify-between text-gray-600">
									<span>Shipping</span>
									<span className="text-green-600 font-medium">Free</span>
								</div>
								<div className="border-t border-gray-200 pt-3 mt-4">
									<div className="flex justify-between text-lg font-bold text-gray-900">
										<span>Total</span>
										<span>${totalPrice.toFixed(2)}</span>
									</div>
								</div>
							</div>

							<Link
								to="/cart"
								className="shrink-0 block text-center text-gray-600 hover:text-gray-900 font-medium transition-colors text-sm mt-4"
							>
								Edit Cart
							</Link>
						</div>
					</div>
				</div>
			</div>
		</AppLayout>
	);
}