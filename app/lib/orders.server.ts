import { access, mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { orderStatuses, type OrderStatus } from "~/lib/orders";

export type OrderItem = {
	productId: number;
	quantity: number;
	price: number;
	title: string;
	thumbnail: string;
};

export type ShippingAddress = {
	firstName: string;
	lastName: string;
	email: string;
	address: string;
	city: string;
	state: string;
	zipCode: string;
};

export type PaymentInfo = {
	cardNumber: string;
	expiryDate: string;
	cvv: string;
};

export type Order = {
	id: string;
	userId: string;
	userEmail: string;
	items: OrderItem[];
	shippingAddress: ShippingAddress;
	paymentInfo: PaymentInfo;
	status: OrderStatus;
	totalPrice: number;
	totalItems: number;
	createdAt: string;
	updatedAt: string;
};

const OrderItemSchema = z.object({
	productId: z.number(),
	quantity: z.number().int().positive(),
	price: z.number().positive(),
	title: z.string(),
	thumbnail: z.string(),
});

const ShippingAddressSchema = z.object({
	firstName: z.string().min(1),
	lastName: z.string().min(1),
	email: z.string().email(),
	address: z.string().min(1),
	city: z.string().min(1),
	state: z.string().min(1),
	zipCode: z.string().min(1),
});

const PaymentInfoSchema = z.object({
	cardNumber: z.string().min(1),
	expiryDate: z.string().min(1),
	cvv: z.string().min(1),
});

const OrderSchema = z.object({
	id: z.string().min(1),
	userId: z.string().min(1),
	userEmail: z.string().email(),
	items: z.array(OrderItemSchema),
	shippingAddress: ShippingAddressSchema,
	paymentInfo: PaymentInfoSchema,
	status: z.enum(orderStatuses),
	totalPrice: z.number().positive(),
	totalItems: z.number().int().positive(),
	createdAt: z.string().min(1),
	updatedAt: z.string().min(1),
});

const OrdersFileInputSchema = z.array(OrderSchema);

// Lenient schema for reading existing orders that might be missing email
const ShippingAddressSchemaLenient = z.object({
	firstName: z.string().min(1),
	lastName: z.string().min(1),
	email: z.string().email().optional(),
	address: z.string().min(1),
	city: z.string().min(1),
	state: z.string().min(1),
	zipCode: z.string().min(1),
});

const OrderSchemaLenient = z.object({
	id: z.string().min(1),
	userId: z.string().min(1),
	userEmail: z.string().email(),
	items: z.array(OrderItemSchema),
	shippingAddress: ShippingAddressSchemaLenient,
	paymentInfo: PaymentInfoSchema,
	status: z.enum(orderStatuses),
	totalPrice: z.number().positive(),
	totalItems: z.number().int().positive(),
	createdAt: z.string().min(1),
	updatedAt: z.string().min(1),
});

const OrdersFileInputSchemaLenient = z.array(OrderSchemaLenient);

function getOrdersFilePath(): string {
	return path.join(process.cwd(), "data", "orders.json");
}

async function ensureOrdersFile(): Promise<void> {
	const filePath = getOrdersFilePath();
	const dir = path.dirname(filePath);
	await mkdir(dir, { recursive: true });
	try {
		await access(filePath);
	} catch {
		await writeFile(filePath, "[]\n", "utf8");
	}
}

async function readOrders(): Promise<Order[]> {
	await ensureOrdersFile();
	const filePath = getOrdersFilePath();
	const raw = await readFile(filePath, "utf8");
	
	let parsedJson: unknown;
	try {
		parsedJson = JSON.parse(raw);
	} catch (error) {
		throw new Error(`Failed to parse orders JSON file: ${error instanceof Error ? error.message : String(error)}`);
	}

	// First try strict parsing - if it works, return immediately
	const strictResult = OrdersFileInputSchema.safeParse(parsedJson);
	if (strictResult.success) {
		return strictResult.data;
	}

	// If strict parsing fails, try lenient schema to handle missing emails
	const lenientResult = OrdersFileInputSchemaLenient.safeParse(parsedJson);
	
	if (!lenientResult.success) {
		// If lenient parsing also fails, throw a detailed error
		const errorDetails = lenientResult.error.errors.map((err) => 
			`${err.path.join(".")}: ${err.message}`
		).join("; ");
		throw new Error(`Failed to parse orders file: ${errorDetails}`);
	}

	// Migrate orders that are missing email in shippingAddress
	const ordersToMigrate = lenientResult.data.filter(
		(order) => !order.shippingAddress.email
	);

	if (ordersToMigrate.length > 0) {
		// Fix orders by using userEmail as fallback for missing shippingAddress.email
		const fixedOrders = lenientResult.data.map((order) => {
			if (!order.shippingAddress.email) {
				return {
					...order,
					shippingAddress: {
						...order.shippingAddress,
						email: order.userEmail,
					},
				};
			}
			return order;
		});

		// Validate fixed orders with strict schema
		const validatedResult = OrdersFileInputSchema.safeParse(fixedOrders);
		if (!validatedResult.success) {
			const errorDetails = validatedResult.error.errors.map((err) => 
				`${err.path.join(".")}: ${err.message}`
			).join("; ");
			throw new Error(`Failed to validate fixed orders: ${errorDetails}`);
		}
		
		// Write back the fixed orders
		const tmpPath = `${filePath}.tmp`;
		await writeFile(tmpPath, `${JSON.stringify(validatedResult.data, null, 2)}\n`, "utf8");
		await rename(tmpPath, filePath);
		
		return validatedResult.data;
	}

	// All orders are valid but lenient parsing was used (shouldn't happen)
	// Try strict parsing one more time
	const finalResult = OrdersFileInputSchema.safeParse(parsedJson);
	if (finalResult.success) {
		return finalResult.data;
	}
	
	throw new Error("Unexpected error: orders passed lenient validation but failed strict validation");
}

async function writeOrders(orders: Order[]): Promise<void> {
	await ensureOrdersFile();
	const filePath = getOrdersFilePath();
	const tmpPath = `${filePath}.tmp`;
	await writeFile(tmpPath, `${JSON.stringify(orders, null, 2)}\n`, "utf8");
	await rename(tmpPath, filePath);
}

export type CreateOrderInput = {
	userId: string;
	userEmail: string;
	items: OrderItem[];
	shippingAddress: ShippingAddress;
	paymentInfo: PaymentInfo;
	totalPrice: number;
	totalItems: number;
};

/**
 * Create a new order
 */
export async function createOrder(input: CreateOrderInput): Promise<Order> {
	console.log("[createOrder] Starting order creation...");
	console.log("[createOrder] Input received:", {
		userId: input.userId,
		userEmail: input.userEmail,
		itemsCount: input.items.length,
		totalPrice: input.totalPrice,
		totalItems: input.totalItems,
		hasShippingAddress: !!input.shippingAddress,
		hasPaymentInfo: !!input.paymentInfo,
	});

	try {
		console.log("[createOrder] Reading existing orders...");
		const orders = await readOrders();
		console.log("[createOrder] Existing orders count:", orders.length);

		console.log("[createOrder] Creating order object...");
		const now = new Date().toISOString();
		const orderId = randomUUID();
		console.log("[createOrder] Generated order ID:", orderId);

		const order: Order = {
			id: orderId,
			userId: input.userId,
			userEmail: input.userEmail,
			items: input.items,
			shippingAddress: input.shippingAddress,
			paymentInfo: input.paymentInfo,
			status: "pending",
			totalPrice: input.totalPrice,
			totalItems: input.totalItems,
			createdAt: now,
			updatedAt: now,
		};

		console.log("[createOrder] Order object created:", {
			id: order.id,
			userId: order.userId,
			itemsCount: order.items.length,
			status: order.status,
		});

		console.log("[createOrder] Adding order to array...");
		orders.push(order);
		console.log("[createOrder] Orders array updated, new count:", orders.length);

		console.log("[createOrder] Writing orders to file...");
		await writeOrders(orders);
		console.log("[createOrder] Orders written to file successfully");

		console.log("[createOrder] Order creation completed successfully");
		return order;
	} catch (error) {
		console.error("[createOrder] ERROR in createOrder function:");
		console.error("[createOrder] Error type:", typeof error);
		console.error("[createOrder] Error constructor:", error?.constructor?.name);
		if (error instanceof Error) {
			console.error("[createOrder] Error name:", error.name);
			console.error("[createOrder] Error message:", error.message);
			console.error("[createOrder] Error stack:", error.stack);
		} else {
			console.error("[createOrder] Error value:", JSON.stringify(error, null, 2));
		}
		throw error;
	}
}

/**
 * Get order by ID
 */
export async function getOrderById(orderId: string): Promise<Order | null> {
	const orders = await readOrders();
	return orders.find((o) => o.id === orderId) ?? null;
}

/**
 * Get all orders for a user
 */
export async function getOrdersByUserId(userId: string): Promise<Order[]> {
	const orders = await readOrders();
	return orders.filter((o) => o.userId === userId).sort((a, b) => 
		new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
	);
}

/**
 * Get all orders (for admin)
 */
export async function getAllOrders(): Promise<Order[]> {
	const orders = await readOrders();
	return orders.sort((a, b) => 
		new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
	);
}

/**
 * Update order status
 */
export async function updateOrderStatus(
	orderId: string,
	status: OrderStatus
): Promise<Order | null> {
	const orders = await readOrders();
	const orderIndex = orders.findIndex((o) => o.id === orderId);

	if (orderIndex < 0) {
		return null;
	}

	orders[orderIndex] = {
		...orders[orderIndex],
		status,
		updatedAt: new Date().toISOString(),
	};

	await writeOrders(orders);
	return orders[orderIndex];
}

