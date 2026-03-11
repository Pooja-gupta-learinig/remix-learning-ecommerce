// Import ActionFunctionArgs type to get proper TypeScript typing for Remix action function parameters
import type { ActionFunctionArgs } from "react-router";
// Import zod for runtime schema validation - ensures data integrity before processing cart operations
import { z } from "zod";
// Import cart manipulation functions that handle session-based cart storage
import {
	addItemToCart,
	updateCartItem,
	removeItemFromCart,
	clearCart,
} from "~/lib/cart-session.server";

// Schema for adding items: uses literal "add" to discriminate action type at runtime
const AddToCartSchema = z.object({
	// Literal ensures only "add" string is accepted, enabling discriminated union pattern
	action: z.literal("add"),
	// coerce.number() converts string form data to number automatically (formData values are always strings)
	productId: z.coerce.number(),
	// quantity is optional with default 1 - allows adding without specifying quantity (common UX pattern)
	// int() ensures whole numbers only, positive() prevents negative quantities
	quantity: z.coerce.number().int().positive().optional().default(1),
});

// Schema for updating items: requires explicit quantity (no default) since update must specify new value
const UpdateCartSchema = z.object({
	// Literal "update" discriminates this action type
	action: z.literal("update"),
	// productId needed to identify which cart item to update
	productId: z.coerce.number(),
	// quantity is required (not optional) - update must specify the new quantity explicitly
	// int() and positive() ensure valid quantity values
	quantity: z.coerce.number().int().positive(),
});

// Schema for removing items: only needs action and productId (no quantity needed for removal)
const RemoveFromCartSchema = z.object({
	// Literal "remove" discriminates this action type
	action: z.literal("remove"),
	// productId identifies which item to remove from cart
	productId: z.coerce.number(),
});

// Schema for clearing cart: only needs action (no productId or quantity needed)
const ClearCartSchema = z.object({
	// Literal "clear" discriminates this action type
	action: z.literal("clear"),
});

// Discriminated union uses "action" field to determine which schema to validate against
// This provides type-safe narrowing: TypeScript knows which fields are available based on action value
const CartActionSchema = z.discriminatedUnion("action", [
	AddToCartSchema,
	UpdateCartSchema,
	RemoveFromCartSchema,
	ClearCartSchema,
]);

// Remix action function: handles POST/PUT/DELETE requests to this route
// Exported so Remix can automatically wire it up to handle form submissions
export async function action({ request }: ActionFunctionArgs) {
	// Security: Validate HTTP method
	if (request.method !== "POST") {
		return new Response(
			JSON.stringify({ success: false, error: "Method not allowed" }),
			{
				status: 405,
				headers: { "Content-Type": "application/json" },
			}
		);
	}

	// Security: Rate limiting
	const clientIp = request.headers.get("X-Forwarded-For")?.split(",")[0]?.trim() ||
		request.headers.get("X-Real-IP") ||
		"unknown";
	
	const { checkRateLimit } = await import("~/lib/security.server");
	const rateLimit = checkRateLimit(`cart:${clientIp}`, 30, 60 * 1000); // 30 requests per minute
	
	if (!rateLimit.allowed) {
		return new Response(
			JSON.stringify({
				success: false,
				error: "Too many requests. Please try again later.",
			}),
			{
				status: 429,
				headers: {
					"Content-Type": "application/json",
					"Retry-After": "60",
				},
			}
		);
	}

	// Security: CSRF protection (Remix handles this via SameSite cookies, but we validate origin)
	const origin = request.headers.get("Origin");
	const host = request.headers.get("Host");
	if (origin && host) {
		try {
			const originUrl = new URL(origin);
			const requestUrl = new URL(request.url);
			// In production, ensure origin matches request hostname
			if (process.env.NODE_ENV === "production" && originUrl.hostname !== requestUrl.hostname) {
				return new Response(
					JSON.stringify({ success: false, error: "Invalid request origin" }),
					{
						status: 403,
						headers: { "Content-Type": "application/json" },
					}
				);
			}
		} catch {
			// Invalid origin URL
			return new Response(
				JSON.stringify({ success: false, error: "Invalid request" }),
				{
					status: 400,
					headers: { "Content-Type": "application/json" },
				}
			);
		}
	}

	// Extract form data from request - Remix forms send data as FormData
	const formData = await request.formData();
	// Convert FormData to plain object for easier manipulation with zod
	// FormData.get() returns string | File | null, Object.fromEntries simplifies to Record<string, string>
	const data = Object.fromEntries(formData);

	// safeParse() doesn't throw - returns success/error object, allowing graceful error handling
	// Validates data structure and types before processing to prevent runtime errors
	const parsed = CartActionSchema.safeParse(data);

	// Early return pattern: validate input before processing to fail fast on invalid data
	if (!parsed.success) {
		// Return 400 Bad Request - client sent invalid data structure
		return new Response(
			// JSON response for consistent API format - frontend can parse and display errors
			JSON.stringify({
				// success flag allows frontend to check status without parsing HTTP status codes
				success: false,
				// Human-readable error message for user-facing error displays
				error: "Invalid request data",
				// Include validation issues so frontend can show field-specific errors
				issues: parsed.error.issues,
			}),
			{
				// 400 status indicates client error (bad request format)
				status: 400,
				// Content-Type header tells client to parse response as JSON
				headers: { "Content-Type": "application/json" },
			}
		);
	}

	// Try-catch wraps cart operations to handle unexpected errors (database failures, etc.)
	try {
		// Switch on discriminated union action field - TypeScript narrows type in each case
		switch (parsed.data.action) {
			case "add": {
				// Call server function that handles session cart logic and persistence
				const result = await addItemToCart(
					// Pass request to access session cookies for cart storage
					request,
					// TypeScript knows productId exists because discriminated union narrowed the type
					parsed.data.productId,
					// quantity is guaranteed to exist (with default) after schema validation
					parsed.data.quantity
				);

				// Return success response with updated cart state
				return new Response(
					JSON.stringify({
						// success flag for easy frontend status checking
						success: true,
						// Return full cart so frontend can update UI without additional request
						cart: result.cart,
					}),
					{
						// 200 OK indicates successful operation
						status: 200,
						headers: {
							// Content-Type for JSON parsing
							"Content-Type": "application/json",
							// Spread result.headers to include session cookie updates (Set-Cookie header)
							// Session functions return headers to update cookies after cart modification
							...result.headers,
						},
					}
				);
			}

			case "update": {
				// Update existing cart item quantity
				const result = await updateCartItem(
					// Request needed for session access
					request,
					// productId identifies which item to update
					parsed.data.productId,
					// New quantity value (required, validated as positive integer)
					parsed.data.quantity
				);

				// Check if item exists - updateCartItem returns null if productId not in cart
				if (!result) {
					// Return 404 Not Found - item doesn't exist in cart to update
					return new Response(
						JSON.stringify({ success: false, error: "Item not found in cart" }),
						{
							// 404 indicates resource (cart item) not found
							status: 404,
							headers: { "Content-Type": "application/json" },
						}
					);
				}

				// Return success with updated cart state
				return new Response(
					JSON.stringify({
						success: true,
						// Updated cart includes the modified item with new quantity
						cart: result.cart,
					}),
					{
						status: 200,
						headers: {
							"Content-Type": "application/json",
							// Include session cookie headers for updated cart state
							...result.headers,
						},
					}
				);
			}

			case "remove": {
				// Remove item from cart entirely
				const result = await removeItemFromCart(request, parsed.data.productId);

				// Check if item existed - returns null if productId not found in cart
				if (!result) {
					// Return 404 - can't remove what doesn't exist
					return new Response(
						JSON.stringify({ success: false, error: "Item not found in cart" }),
						{
							status: 404,
							headers: { "Content-Type": "application/json" },
						}
					);
				}

				// Return success with cart state after removal
				return new Response(
					JSON.stringify({
						success: true,
						// Cart no longer contains the removed item
						cart: result.cart,
					}),
					{
						status: 200,
						headers: {
							"Content-Type": "application/json",
							// Session headers update cookie with cart after item removal
							...result.headers,
						},
					}
				);
			}

			case "clear": {
				// Clear all items from cart
				const result = await clearCart(request);

				// Return success with empty cart state
				return new Response(
					JSON.stringify({
						success: true,
						// Cart is now empty
						cart: result.cart,
					}),
					{
						status: 200,
						headers: {
							"Content-Type": "application/json",
							// Session headers update cookie with empty cart
							...result.headers,
						},
					}
				);
			}

			// Default case should never execute due to discriminated union validation
			// But included for TypeScript exhaustiveness checking and runtime safety
			default:
				return new Response(
					JSON.stringify({ success: false, error: "Unknown action" }),
					{
						// 400 Bad Request - action value passed validation but isn't handled
						status: 400,
						headers: { "Content-Type": "application/json" },
					}
				);
		}
	} catch (error) {
		// Log error for server-side debugging and monitoring
		console.error("Cart action error:", error);
		// Return generic error to client - don't expose internal error details for security
		return new Response(
			JSON.stringify({ success: false, error: "Failed to update cart" }),
			{
				// 500 Internal Server Error - unexpected server-side failure
				status: 500,
				headers: { "Content-Type": "application/json" },
			}
		);
	}
}

