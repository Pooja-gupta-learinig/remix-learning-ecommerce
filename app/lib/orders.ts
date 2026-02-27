export const orderStatuses = ["pending", "processing", "shipped", "delivered", "cancelled"] as const;
export type OrderStatus = (typeof orderStatuses)[number];

