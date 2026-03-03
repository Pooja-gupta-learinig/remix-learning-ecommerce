/**
 * @file Admin server utilities
 * Shared loaders and utilities for admin routes
 */

import { requireRole } from "~/sessions.server";
import { getAllOrders } from "~/lib/orders.server";
import { fetchProducts } from "~/lib/products";
import { fetchUsers } from "~/lib/users";
import type { Order } from "~/lib/orders.server";

/**
 * Shared loader for admin routes - ensures admin role and provides common data
 */
export async function adminLoader(request: Request) {
	const user = await requireRole(request, "admin");
	return { user };
}

/**
 * Dashboard stats loader
 */
export async function getDashboardStats() {
	const [orders, productsData, usersData] = await Promise.all([
		getAllOrders(),
		fetchProducts({}),
		fetchUsers(),
	]);

	const totalOrders = orders.length;
	const totalRevenue = orders.reduce((sum, order) => sum + order.totalPrice, 0);
	const totalProducts = productsData.total;
	const pendingOrders = orders.filter((o) => o.status === "pending").length;
	const recentOrders = orders.slice(0, 5);

	return {
		totalOrders,
		totalRevenue,
		totalProducts,
		pendingOrders,
		recentOrders,
		totalUsers: usersData.total,
	};
}

