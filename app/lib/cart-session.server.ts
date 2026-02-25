import { z } from "zod";
import { getSession, commitSession } from "~/sessions.server";

export type CartItem = {
	productId: number;
	quantity: number;
};

export type Cart = {
	items: CartItem[];
};

const cartKey = "cart";

const CartItemSchema = z.object({
	productId: z.number(),
	quantity: z.number().int().positive(),
});

const CartSchema = z.object({
	items: z.array(CartItemSchema),
});

/**
 * Get cart from session
 */
export async function getCart(request: Request): Promise<Cart> {
	const session = await getSession(request.headers.get("Cookie"));
	const cart = session.get(cartKey) as unknown;

	if (!cart || typeof cart !== "object") {
		return { items: [] };
	}

	const parsed = CartSchema.safeParse(cart);
	return parsed.success ? parsed.data : { items: [] };
}

/**
 * Save cart to session
 */
export async function saveCart(request: Request, cart: Cart): Promise<HeadersInit> {
	const session = await getSession(request.headers.get("Cookie"));
	session.set(cartKey, cart);

	return {
		"Set-Cookie": await commitSession(session),
	};
}

/**
 * Add item to cart
 */
export async function addItemToCart(
	request: Request,
	productId: number,
	quantity?: number
): Promise<{ cart: Cart; headers: HeadersInit }> {
	const cart = await getCart(request);
	const qty = quantity ?? 1;

	const existingItemIndex = cart.items.findIndex(
		(cartItem) => cartItem.productId === productId
	);

	if (existingItemIndex >= 0) {
		// Update existing item quantity
		cart.items[existingItemIndex].quantity += qty;
	} else {
		// Add new item
		cart.items.push({
			productId,
			quantity: qty,
		});
	}

	const headers = await saveCart(request, cart);
	return { cart, headers };
}

/**
 * Update item quantity in cart
 */
export async function updateCartItem(
	request: Request,
	productId: number,
	quantity: number
): Promise<{ cart: Cart; headers: HeadersInit } | null> {
	if (quantity <= 0) {
		return removeItemFromCart(request, productId);
	}

	const cart = await getCart(request);
	const itemIndex = cart.items.findIndex((item) => item.productId === productId);

	if (itemIndex < 0) {
		return null;
	}

	cart.items[itemIndex].quantity = quantity;
	const headers = await saveCart(request, cart);
	return { cart, headers };
}

/**
 * Remove item from cart
 */
export async function removeItemFromCart(
	request: Request,
	productId: number
): Promise<{ cart: Cart; headers: HeadersInit } | null> {
	const cart = await getCart(request);
	const itemIndex = cart.items.findIndex((item) => item.productId === productId);

	if (itemIndex < 0) {
		return null;
	}

	cart.items.splice(itemIndex, 1);
	const headers = await saveCart(request, cart);
	return { cart, headers };
}

