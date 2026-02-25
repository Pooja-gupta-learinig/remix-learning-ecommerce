import type { ActionFunctionArgs } from "react-router";
import { z } from "zod";
import {
	addItemToCart,
	updateCartItem,
	removeItemFromCart,
} from "~/lib/cart-session.server";

const AddToCartSchema = z.object({
	action: z.literal("add"),
	productId: z.coerce.number(),
	quantity: z.coerce.number().int().positive().optional().default(1),
});

const UpdateCartSchema = z.object({
	action: z.literal("update"),
	productId: z.coerce.number(),
	quantity: z.coerce.number().int().positive(),
});

const RemoveFromCartSchema = z.object({
	action: z.literal("remove"),
	productId: z.coerce.number(),
});

const CartActionSchema = z.discriminatedUnion("action", [
	AddToCartSchema,
	UpdateCartSchema,
	RemoveFromCartSchema,
]);

export async function action({ request }: ActionFunctionArgs) {
	const formData = await request.formData();
	const data = Object.fromEntries(formData);

	const parsed = CartActionSchema.safeParse(data);

	if (!parsed.success) {
		return new Response(
			JSON.stringify({
				success: false,
				error: "Invalid request data",
				issues: parsed.error.issues,
			}),
			{
				status: 400,
				headers: { "Content-Type": "application/json" },
			}
		);
	}

	try {
		switch (parsed.data.action) {
			case "add": {
				const result = await addItemToCart(
					request,
					parsed.data.productId,
					parsed.data.quantity
				);

				return new Response(
					JSON.stringify({
						success: true,
						cart: result.cart,
					}),
					{
						status: 200,
						headers: {
							"Content-Type": "application/json",
							...result.headers,
						},
					}
				);
			}

			case "update": {
				const result = await updateCartItem(
					request,
					parsed.data.productId,
					parsed.data.quantity
				);

				if (!result) {
					return new Response(
						JSON.stringify({ success: false, error: "Item not found in cart" }),
						{
							status: 404,
							headers: { "Content-Type": "application/json" },
						}
					);
				}

				return new Response(
					JSON.stringify({
						success: true,
						cart: result.cart,
					}),
					{
						status: 200,
						headers: {
							"Content-Type": "application/json",
							...result.headers,
						},
					}
				);
			}

			case "remove": {
				const result = await removeItemFromCart(request, parsed.data.productId);

				if (!result) {
					return new Response(
						JSON.stringify({ success: false, error: "Item not found in cart" }),
						{
							status: 404,
							headers: { "Content-Type": "application/json" },
						}
					);
				}

				return new Response(
					JSON.stringify({
						success: true,
						cart: result.cart,
					}),
					{
						status: 200,
						headers: {
							"Content-Type": "application/json",
							...result.headers,
						},
					}
				);
			}

			default:
				return new Response(
					JSON.stringify({ success: false, error: "Unknown action" }),
					{
						status: 400,
						headers: { "Content-Type": "application/json" },
					}
				);
		}
	} catch (error) {
		console.error("Cart action error:", error);
		return new Response(
			JSON.stringify({ success: false, error: "Failed to update cart" }),
			{
				status: 500,
				headers: { "Content-Type": "application/json" },
			}
		);
	}
}

