import { Form, useNavigation, redirect, Link, useLoaderData, useActionData } from "react-router";
import { useState } from "react";
import type { Route } from "./+types/checkout.review";
import { getSession, commitSession, requireUserSession } from "~/sessions.server";
import { getCart, saveCart } from "~/lib/cart-session.server";
import { createOrder } from "~/lib/orders.server";
import { fetchProductById } from "~/lib/product-detail";
import type { Product } from "~/types/product.types";

const checkoutDataKey = "checkoutData";

export async function loader({ request }: Route.LoaderArgs) {
	const session = await getSession(request.headers.get("Cookie"));
	const checkoutData = session.get(checkoutDataKey);

	// If no address or payment data, redirect to appropriate step
	if (!checkoutData?.address) {
		throw redirect("/checkout/address");
	}
	if (!checkoutData?.payment) {
		throw redirect("/checkout/payment");
	}

	return {
		address: checkoutData.address,
		payment: checkoutData.payment,
	};
}

export async function action({ request }: Route.ActionArgs) {
	// Log immediately - this should always show if action is called
	// Using process.stdout.write for guaranteed output
	process.stdout.write("=== ORDER PLACEMENT STARTED ===\n");
	console.log("=== ORDER PLACEMENT STARTED ===");
	console.log("Action called with method:", request.method);
	console.log("Action called with URL:", request.url);
	
	// Also log to stderr which is more reliable
	console.error("[ACTION] Order placement action called");
	
	try {
		// Validate terms and conditions
		const formData = await request.formData();
		const termsAccepted = formData.get("terms");
		
		if (!termsAccepted) {
			console.error("[ERROR] Terms and conditions not accepted");
			return {
				error: "Please accept the Terms and Conditions to place your order.",
				termsError: true,
			};
		}

		console.log("[1] Getting user session...");
		const user = await requireUserSession(request);
		console.log("[1] User session retrieved:", { userId: user.id, email: user.email });

		console.log("[2] Getting session and checkout data...");
		const session = await getSession(request.headers.get("Cookie"));
		const checkoutData = session.get(checkoutDataKey);
		console.log("[2] Checkout data exists:", {
			hasAddress: !!checkoutData?.address,
			hasPayment: !!checkoutData?.payment,
			addressKeys: checkoutData?.address ? Object.keys(checkoutData.address) : [],
			paymentKeys: checkoutData?.payment ? Object.keys(checkoutData.payment) : [],
		});

		// Validate that we have all required data
		if (!checkoutData?.address || !checkoutData?.payment) {
			console.error("[ERROR] Missing checkout data:", {
				hasAddress: !!checkoutData?.address,
				hasPayment: !!checkoutData?.payment,
			});
			return {
				error: "Missing checkout data. Please complete all steps.",
			};
		}

		console.log("[3] Getting cart...");
		const cart = await getCart(request);
		console.log("[3] Cart retrieved:", {
			itemCount: cart.items.length,
			items: cart.items.map((item) => ({ productId: item.productId, quantity: item.quantity })),
		});

		if (cart.items.length === 0) {
			console.log("[3] Cart is empty, redirecting to cart page");
			throw redirect("/cart");
		}

		console.log("[4] Fetching product details for cart items...");
		const cartItemsWithProducts = await Promise.all(
			cart.items.map(async (item) => {
				try {
					console.log(`[4] Fetching product ${item.productId}...`);
					const product = await fetchProductById(String(item.productId));
					console.log(`[4] Product ${item.productId} fetched:`, {
						title: product.title,
						price: product.price,
						discount: product.discountPercentage,
					});
					return {
						...item,
						product,
					};
				} catch (error) {
					console.error(`[4] Failed to fetch product ${item.productId}:`, error);
					if (error instanceof Error) {
						console.error(`[4] Error details for product ${item.productId}:`, error.message, error.stack);
					}
					return null;
				}
			})
		);

		console.log("[4] Product fetching completed:", {
			total: cartItemsWithProducts.length,
			successful: cartItemsWithProducts.filter((item) => item !== null).length,
		});

		// Filter out any failed product fetches
		const validItems = cartItemsWithProducts.filter(
			(item): item is { productId: number; quantity: number; product: Product } =>
				item !== null
		);

		if (validItems.length === 0) {
			console.error("[ERROR] No valid items after filtering");
			return {
				error: "No valid items in cart. Please add items to your cart.",
			};
		}

		console.log("[5] Calculating order totals...");
		const totalItems = validItems.reduce((sum, item) => sum + item.quantity, 0);
		const totalPrice = validItems.reduce((sum, item) => {
			const discountedPrice =
				item.product.price - (item.product.price * item.product.discountPercentage) / 100;
			return sum + discountedPrice * item.quantity;
		}, 0);
		console.log("[5] Totals calculated:", { totalItems, totalPrice });

		console.log("[6] Transforming cart items to order items...");
		const orderItems = validItems.map((item) => {
			const discountedPrice =
				item.product.price - (item.product.price * item.product.discountPercentage) / 100;
			return {
				productId: item.productId,
				quantity: item.quantity,
				price: discountedPrice,
				title: item.product.title,
				thumbnail: item.product.thumbnail,
			};
		});
		console.log("[6] Order items transformed:", {
			count: orderItems.length,
			items: orderItems.map((item) => ({
				productId: item.productId,
				quantity: item.quantity,
				price: item.price,
				title: item.title.substring(0, 30) + "...",
			})),
		});

		console.log("[7] Validating and transforming payment data...");
		console.log("[7] Payment data structure:", {
			hasCardNumber: !!checkoutData.payment.cardNumber,
			cardNumberType: typeof checkoutData.payment.cardNumber,
			hasExpiryMonth: typeof checkoutData.payment.expiryMonth !== "undefined",
			expiryMonthType: typeof checkoutData.payment.expiryMonth,
			expiryMonthValue: checkoutData.payment.expiryMonth,
			hasExpiryYear: typeof checkoutData.payment.expiryYear !== "undefined",
			expiryYearType: typeof checkoutData.payment.expiryYear,
			expiryYearValue: checkoutData.payment.expiryYear,
			hasCvv: !!checkoutData.payment.cvv,
			cvvType: typeof checkoutData.payment.cvv,
			fullPaymentData: checkoutData.payment,
		});

		// Validate payment data structure
		if (
			!checkoutData.payment.cardNumber ||
			typeof checkoutData.payment.expiryMonth === "undefined" ||
			typeof checkoutData.payment.expiryYear === "undefined" ||
			!checkoutData.payment.cvv
		) {
			console.error("[ERROR] Invalid payment data structure:", {
				cardNumber: checkoutData.payment.cardNumber,
				expiryMonth: checkoutData.payment.expiryMonth,
				expiryYear: checkoutData.payment.expiryYear,
				cvv: checkoutData.payment.cvv,
			});
			return {
				error: "Invalid payment information. Please complete the payment step again.",
			};
		}

		// Transform payment data to match Order schema
		// Note: cardNumber is masked in session, so we'll use it as-is for demo purposes
		// expiryYear is stored as 2-digit number (e.g., 23, 24), expiryMonth is 1-12
		const expiryMonth = String(checkoutData.payment.expiryMonth).padStart(2, "0");
		const expiryYear = String(checkoutData.payment.expiryYear).padStart(2, "0");
		
		const paymentInfo = {
			cardNumber: checkoutData.payment.cardNumber, // This is masked (**** **** **** 1234)
			expiryDate: `${expiryMonth}${expiryYear}`, // Format: MMYY (e.g., "0623")
			cvv: checkoutData.payment.cvv,
		};
		console.log("[7] Payment info transformed:", {
			cardNumber: paymentInfo.cardNumber.substring(0, 10) + "...",
			expiryDate: paymentInfo.expiryDate,
			hasCvv: !!paymentInfo.cvv,
		});

		console.log("[8] Validating and transforming address data...");
		console.log("[8] Address data structure:", {
			hasFirstName: !!checkoutData.address.firstName,
			hasLastName: !!checkoutData.address.lastName,
			hasEmail: !!checkoutData.address.email,
			hasAddress: !!checkoutData.address.address,
			hasCity: !!checkoutData.address.city,
			hasState: !!checkoutData.address.state,
			hasZipCode: !!checkoutData.address.zipCode,
			addressKeys: Object.keys(checkoutData.address),
		});

		// Validate address data structure
		if (
			!checkoutData.address.firstName ||
			!checkoutData.address.lastName ||
			!checkoutData.address.email ||
			!checkoutData.address.address ||
			!checkoutData.address.city ||
			!checkoutData.address.state ||
			!checkoutData.address.zipCode
		) {
			console.error("[ERROR] Invalid address data structure:", checkoutData.address);
			return {
				error: "Invalid shipping address. Please complete the address step again.",
			};
		}

		// Transform shipping address
		const shippingAddress = {
			firstName: checkoutData.address.firstName,
			lastName: checkoutData.address.lastName,
			email: checkoutData.address.email,
			address: checkoutData.address.address,
			city: checkoutData.address.city,
			state: checkoutData.address.state,
			zipCode: checkoutData.address.zipCode,
		};
		console.log("[8] Shipping address transformed:", {
			name: `${shippingAddress.firstName} ${shippingAddress.lastName}`,
			city: shippingAddress.city,
			state: shippingAddress.state,
		});

		console.log("[9] Preparing order data for creation...");
		const orderInput = {
			userId: user.id,
			userEmail: user.email,
			items: orderItems,
			shippingAddress,
			paymentInfo,
			totalPrice,
			totalItems,
		};
		console.log("[9] Order input prepared:", {
			userId: orderInput.userId,
			userEmail: orderInput.userEmail,
			itemsCount: orderInput.items.length,
			totalPrice: orderInput.totalPrice,
			totalItems: orderInput.totalItems,
			hasShippingAddress: !!orderInput.shippingAddress,
			hasPaymentInfo: !!orderInput.paymentInfo,
		});

		console.log("[10] Calling createOrder function...");
		const order = await createOrder(orderInput);
		console.log("[10] Order created successfully:", {
			orderId: order.id,
			status: order.status,
			totalPrice: order.totalPrice,
			totalItems: order.totalItems,
		});

		console.log("[11] Clearing cart...");
		const emptyCart = { items: [] };
		const cartHeaders = await saveCart(request, emptyCart);
		console.log("[11] Cart cleared");

		console.log("[12] Clearing checkout data from session...");
		session.unset(checkoutDataKey);
		console.log("[12] Checkout data cleared");

		console.log("[13] Preparing redirect to orders page...");
		const sessionCookie = await commitSession(session);
		console.log("[13] Session committed");

		console.log("[14] Redirecting to orders page with success message");
		// Redirect to orders page with success message
		// Note: redirect() throws a Response, which React Router handles
		throw redirect("/orders?success=true", {
			headers: {
				"Set-Cookie": sessionCookie,
				...cartHeaders,
			},
		});
	} catch (error) {
		// Use both console.error and process.stderr for maximum visibility
		process.stderr.write("=== ORDER PLACEMENT ERROR ===\n");
		console.error("=== ORDER PLACEMENT ERROR ===");
		console.error("Error type:", typeof error);
		console.error("Error constructor:", error?.constructor?.name);
		console.error("Is Response:", error instanceof Response);
		
		if (error instanceof Response) {
			console.log("This is a redirect Response, re-throwing...");
			console.log("Response status:", error.status);
			console.log("Response headers:", Object.fromEntries(error.headers.entries()));
			throw error;
		}
		
		// Log detailed error information
		console.error("Error object:", error);
		if (error instanceof Error) {
			console.error("Error name:", error.name);
			console.error("Error message:", error.message);
			console.error("Error stack:", error.stack);
			process.stderr.write(`Error: ${error.name}: ${error.message}\n`);
			if (error.stack) {
				process.stderr.write(`Stack: ${error.stack}\n`);
			}
		} else {
			console.error("Error value:", JSON.stringify(error, null, 2));
			process.stderr.write(`Error value: ${JSON.stringify(error)}\n`);
		}
		
		console.error("=== END ERROR LOG ===");
		process.stderr.write("=== END ERROR LOG ===\n");
		
		// Return detailed error information
		const errorDetails: Record<string, unknown> = {
			errorType: typeof error,
			errorConstructor: error?.constructor?.name,
			isResponse: error instanceof Response,
		};
		
		if (error instanceof Error) {
			errorDetails.name = error.name;
			errorDetails.message = error.message;
			errorDetails.stack = error.stack;
		} else {
			errorDetails.value = String(error);
		}
		
		return {
			error: "Failed to place order. Please try again.",
			details: errorDetails,
		};
	}
}

export default function CheckoutReview() {
	const navigation = useNavigation();
	const isSubmitting = navigation.state === "submitting";
	const { address, payment } = useLoaderData<typeof loader>();
	const actionData = useActionData<typeof action>();
	const [termsError, setTermsError] = useState(false);

	// Client-side logging to verify form submission
	console.log("[CLIENT] CheckoutReview component rendered");
	console.log("[CLIENT] Navigation state:", navigation.state);
	console.log("[CLIENT] Is submitting:", isSubmitting);
	console.log("[CLIENT] Action data:", actionData);

	return (
		<div className="bg-white rounded-xl border border-gray-200 p-6 sm:p-8 shadow-sm">
			<h2 className="text-2xl font-bold text-gray-900 mb-6">Review Your Order</h2>

			{actionData?.error && (
				<div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
					<p className="text-red-800 text-sm font-bold">Error: {actionData.error}</p>
					{actionData.details && (
						<pre className="mt-2 text-xs text-red-700 bg-red-100 p-2 rounded overflow-auto">
							{JSON.stringify(actionData.details, null, 2)}
						</pre>
					)}
					<p className="mt-2 text-xs text-red-600">
						Please check the browser console (F12) and server logs for more details.
					</p>
				</div>
			)}

			<div className="space-y-6">
				{/* Shipping Address */}
				<div className="border-b border-gray-200 pb-6">
					<div className="flex items-center justify-between mb-4">
						<h3 className="text-lg font-semibold text-gray-900">Shipping Address</h3>
						<Link
							to="/checkout/address"
							className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
						>
							Edit
						</Link>
					</div>
					<div className="bg-gray-50 rounded-lg p-4">
						<p className="text-gray-900 font-medium">
							{address.firstName} {address.lastName}
						</p>
						<p className="text-gray-600">{address.address}</p>
						<p className="text-gray-600">
							{address.city}, {address.state} {address.zipCode}
						</p>
						<p className="text-gray-600">{address.country}</p>
						<p className="text-gray-600 mt-2">
							{address.email} • {address.phone}
						</p>
					</div>
				</div>

				{/* Payment Information */}
				<div className="border-b border-gray-200 pb-6">
					<div className="flex items-center justify-between mb-4">
						<h3 className="text-lg font-semibold text-gray-900">Payment Method</h3>
						<Link
							to="/checkout/payment"
							className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
						>
							Edit
						</Link>
					</div>
					<div className="bg-gray-50 rounded-lg p-4">
						<div className="flex items-center gap-3">
							<div className="w-12 h-8 bg-gray-200 rounded flex items-center justify-center">
								<svg
									className="w-6 h-6 text-gray-600"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
									/>
								</svg>
							</div>
							<div>
								<p className="text-gray-900 font-medium">{payment.cardNumber}</p>
								<p className="text-sm text-gray-600">
									{payment.cardName} • Expires {String(payment.expiryMonth).padStart(2, "0")}/
									{String(payment.expiryYear).padStart(2, "0")}
								</p>
							</div>
						</div>
					</div>
				</div>

				{/* Order Summary Note */}
				<div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
					<div className="flex items-start gap-2">
						<svg
							className="w-5 h-5 text-blue-600 mt-0.5 shrink-0"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
							/>
						</svg>
						<div>
							<p className="text-sm font-medium text-blue-900 mb-1">Order Summary</p>
							<p className="text-sm text-blue-800">
								Your order summary is displayed in the sidebar. Review all details before placing
								your order.
							</p>
						</div>
					</div>
				</div>

				<Form
					method="post"
					onSubmit={(e) => {
						console.log("[CLIENT] Form submit event triggered");
						const formData = new FormData(e.currentTarget);
						const termsChecked = formData.get("terms") === "on";
						
						if (!termsChecked) {
							e.preventDefault();
							setTermsError(true);
							return;
						}
						
						setTermsError(false);
						console.log("[CLIENT] Form data:", formData);
					}}
				>
					{/* Terms and Conditions */}
					<div className="mb-6">
						<div className="flex items-start gap-3">
							<input
								type="checkbox"
								id="terms"
								name="terms"
								
								onChange={(e) => {
									if (e.target.checked) {
										setTermsError(false);
									}
								}}
								className={`mt-1 w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 ${
									termsError || actionData?.termsError
										? "border-red-500 focus:ring-red-500"
										: ""
								}`}
							/>
							<label htmlFor="terms" className="text-sm text-gray-600">
								I agree to the{" "}
								<Link to="/terms" className="text-indigo-600 hover:text-indigo-700 underline">
									Terms and Conditions
								</Link>{" "}
								and{" "}
								<Link to="/privacy-policy" className="text-indigo-600 hover:text-indigo-700 underline">
									Privacy Policy
								</Link>
							</label>
						</div>
						{(termsError || actionData?.termsError) && (
							<p className="mt-2 text-sm text-red-600">
								Please accept the Terms and Conditions to place your order.
							</p>
						)}
					</div>

					{/* Navigation Buttons */}
					<div className="flex justify-between pt-4 border-t border-gray-200">
						<Link
							to="/checkout/payment"
							className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
						>
							Back to Payment
						</Link>
						<button
							type="submit"
							onClick={() => {
								console.log("[CLIENT] Place Order button clicked");
							}}
							className="bg-gray-900 text-white px-8 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
							disabled={isSubmitting}
						>
							{isSubmitting ? "Placing Order..." : "Place Order"}
						</button>
					</div>
				</Form>
			</div>
		</div>
	);
}

