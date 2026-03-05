import type { Route } from "./+types/cart";
import { useLoaderData, useFetcher, useRevalidator, Link } from "react-router";
import { getCart } from "~/lib/cart-session.server";
import { useTransition } from "react";
import { fetchProductById } from "~/lib/product-detail";
import type { Product } from "~/types/product.types";
import { AppLayout } from "../layouts/AppLayouts";
import { useEffect, useState } from "react";

export async function loader({ request }: Route.LoaderArgs) {
	const cart = await getCart(request);

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

export default function Cart() {
	const { items: initialItems, totalItems: initialTotalItems, totalPrice: initialTotalPrice } = useLoaderData<typeof loader>();
	const fetcher = useFetcher();
	const revalidator = useRevalidator();
	const transition = useTransition();

	// Optimistic state for cart items
	const [optimisticItems, setOptimisticItems] = useState(initialItems);
	const [optimisticTotalItems, setOptimisticTotalItems] = useState(initialTotalItems);
	const [optimisticTotalPrice, setOptimisticTotalPrice] = useState(initialTotalPrice);

	// Update optimistic state when loader data changes
	useEffect(() => {
		setOptimisticItems(initialItems);
		setOptimisticTotalItems(initialTotalItems);
		setOptimisticTotalPrice(initialTotalPrice);
	}, [initialItems, initialTotalItems, initialTotalPrice]);

	useEffect(() => {
		if (fetcher.data?.success) {
			revalidator.revalidate();
		}
	}, [fetcher.data, revalidator]);

	// Use optimistic state during transitions, otherwise use actual data
	const isPending = transition.state !== "idle" || fetcher.state !== "idle";
	const items = isPending ? optimisticItems : initialItems;
	const totalItems = isPending ? optimisticTotalItems : initialTotalItems;
	const totalPrice = isPending ? optimisticTotalPrice : initialTotalPrice;

	if (items.length === 0) {
		return (
			<AppLayout>
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
					<div className="text-center">
						<svg
							className="mx-auto h-24 w-24 text-gray-400"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={1.5}
								d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
							/>
						</svg>
						<h2 className="mt-4 text-2xl font-bold text-gray-900">Your cart is empty</h2>
						<p className="mt-2 text-gray-500">Start shopping to add items to your cart.</p>
						<Link
							to="/products"
							prefetch="intent"
							className="mt-6 inline-block bg-gray-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors"
						>
							Continue Shopping
						</Link>
					</div>
				</div>
			</AppLayout>
		);
	}

	return (
		<AppLayout>
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				<h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

				<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
					{/* Cart Items */}
					<div className="lg:col-span-2 space-y-4 max-h-[1064px] lg:max-h-[1164px] overflow-y-auto overflow-x-hidden pr-2 scroll-smooth">
						{items.map((item) => {
							const discountedPrice =
								item.product.price -
								(item.product.price * item.product.discountPercentage) / 100;
							const itemTotal = discountedPrice * item.quantity;

							return (
								<div
									key={item.productId}
									className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow"
								>
									<div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
										{/* Product Image */}
										<Link
											to={`/products/${item.product.title
												.toLowerCase()
												.replace(/[^a-z0-9]+/g, "-")
												.replace(/^-+|-+$/g, "")}/${item.product.id}/category/${item.product.category
												.toLowerCase()
												.replace(/[^a-z0-9]+/g, "-")
												.replace(/^-+|-+$/g, "")}`}
											className="shrink-0 self-center sm:self-start"
										>
											<img
												src={item.product.thumbnail}
												alt={item.product.title}
												className="w-24 h-24 sm:w-32 sm:h-32 object-cover rounded-lg"
											/>
										</Link>

										{/* Product Info and Controls */}
										<div className="flex-1 min-w-0 flex flex-col justify-between">
											<div>
												<Link
													to={`/products/${item.product.title
														.toLowerCase()
														.replace(/[^a-z0-9]+/g, "-")
														.replace(/^-+|-+$/g, "")}/${item.product.id}/category/${item.product.category
														.toLowerCase()
														.replace(/[^a-z0-9]+/g, "-")
														.replace(/^-+|-+$/g, "")}`}
													className="block"
												>
													<h3 className="text-base sm:text-lg font-semibold text-gray-900 hover:text-gray-700 line-clamp-2">
														{item.product.title}
													</h3>
												</Link>
												<p className="text-xs sm:text-sm text-gray-500 mt-1 line-clamp-2">
													{item.product.description}
												</p>

												{/* Price */}
												<div className="mt-3 flex items-center gap-2 flex-wrap">
													<span className="text-lg sm:text-xl font-bold text-green-600">
														${discountedPrice.toFixed(2)}
													</span>
													{item.product.discountPercentage > 0 && (
														<span className="text-xs sm:text-sm line-through text-gray-400">
															${item.product.price.toFixed(2)}
														</span>
													)}
												</div>

												{/* Stock Warning */}
												{item.product.stock <= 7 && item.product.stock > 0 && (
													<div className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border bg-orange-50 border-orange-200 w-fit">
														<div className="w-2 h-2 rounded-full bg-orange-600" />
														<span className="text-xs sm:text-sm font-medium text-orange-600">
															Only {item.product.stock} left in stock
														</span>
													</div>
												)}
											</div>

											{/* Quantity Controls and Remove */}
											<div className="mt-4 flex flex-wrap items-center gap-4">
												{/* Quantity Controls */}
												<div className="flex items-center gap-2">
													<fetcher.Form method="post" action="/cart/actions" className="flex items-center gap-2">
														<input type="hidden" name="action" value="update" />
														<input type="hidden" name="productId" value={item.productId} />
													<button
														type="button"
														onClick={() => {
															if (item.quantity > 1) {
																// Optimistic update
																const newQuantity = item.quantity - 1;
																const discountedPrice = item.product.price - (item.product.price * item.product.discountPercentage) / 100;
																const priceDiff = discountedPrice;
																
																setOptimisticItems(prev => 
																	prev.map(i => 
																		i.productId === item.productId 
																			? { ...i, quantity: newQuantity }
																			: i
																	)
																);
																setOptimisticTotalItems(prev => prev - 1);
																setOptimisticTotalPrice(prev => prev - priceDiff);

																fetcher.submit(
																	{
																		action: "update",
																		productId: String(item.productId),
																		quantity: String(newQuantity),
																	},
																	{ method: "post", action: "/cart/actions" }
																);
															}
														}}
														disabled={
															item.quantity <= 1 || fetcher.state !== "idle"
														}
															className="w-8 h-8 rounded border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-gray-700"
														>
															-
														</button>
														<span className="text-base sm:text-lg font-semibold min-w-8 text-center text-gray-900">
															{item.quantity}
														</span>
														<button
															type="button"
															onClick={() => {
																if (item.quantity < item.product.stock) {
																	// Optimistic update
																	const newQuantity = item.quantity + 1;
																	const discountedPrice = item.product.price - (item.product.price * item.product.discountPercentage) / 100;
																	const priceDiff = discountedPrice;
																	
																	setOptimisticItems(prev => 
																		prev.map(i => 
																			i.productId === item.productId 
																				? { ...i, quantity: newQuantity }
																				: i
																		)
																	);
																	setOptimisticTotalItems(prev => prev + 1);
																	setOptimisticTotalPrice(prev => prev + priceDiff);

																	fetcher.submit(
																		{
																			action: "update",
																			productId: String(item.productId),
																			quantity: String(newQuantity),
																		},
																		{ method: "post", action: "/cart/actions" }
																	);
																}
															}}
															disabled={
																item.quantity >= item.product.stock ||
																fetcher.state !== "idle"
															}
															className="w-8 h-8 rounded border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-gray-700"
														>
															+
														</button>
													</fetcher.Form>
												</div>

												{/* Remove Button */}
												<div className="flex items-center">
													<fetcher.Form method="post" action="/cart/actions">
														<input type="hidden" name="action" value="remove" />
														<input type="hidden" name="productId" value={item.productId} />
														<button
															type="submit"
															onClick={() => {
																// Optimistic update
																const discountedPrice = item.product.price - (item.product.price * item.product.discountPercentage) / 100;
																const priceDiff = discountedPrice * item.quantity;
																
																setOptimisticItems(prev => prev.filter(i => i.productId !== item.productId));
																setOptimisticTotalItems(prev => prev - item.quantity);
																setOptimisticTotalPrice(prev => prev - priceDiff);
															}}
															disabled={fetcher.state !== "idle"}
															className="text-red-600 hover:text-red-700 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
														>
															Remove
														</button>
													</fetcher.Form>
												</div>
											</div>
										</div>

										{/* Item Total */}
										<div className="flex sm:flex-col justify-between sm:justify-start items-end sm:items-end sm:text-right border-t sm:border-t-0 sm:border-l border-gray-200 pt-4 sm:pt-0 sm:pl-6 sm:ml-4">
											<div className="sm:w-full">
												<p className="text-xs sm:text-sm text-gray-500 mb-1">Item Total</p>
												<p className="text-xl sm:text-2xl font-bold text-gray-900">
													${itemTotal.toFixed(2)}
												</p>
											</div>
										</div>
									</div>
								</div>
							);
						})}
					</div>

					{/* Order Summary */}
					<div className="lg:col-span-1">
						<div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm sticky top-4 max-h-[calc(100vh-2rem)] overflow-y-auto overflow-x-hidden pr-2 scroll-smooth">
							<h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>

							<div className="space-y-3 mb-6">
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
								to="/checkout"
								prefetch="intent"
								className="w-full bg-gray-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors text-center block"
							>
								Proceed to Checkout
							</Link>

							<fetcher.Form method="post" action="/cart/actions" className="mt-4">
								<input type="hidden" name="action" value="clear" />
								<button
									type="submit"
									onClick={() => {
										// Optimistic update
										setOptimisticItems([]);
										setOptimisticTotalItems(0);
										setOptimisticTotalPrice(0);
									}}
									disabled={fetcher.state !== "idle"}
									className="w-full bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
								>
									Clear Cart
								</button>
							</fetcher.Form>

							<Link
								to="/products"
								prefetch="intent"
								className="mt-4 block text-center text-gray-600 hover:text-gray-900 font-medium transition-colors"
							>
								Continue Shopping
							</Link>
						</div>
					</div>
				</div>
			</div>
		</AppLayout>
	);
}
