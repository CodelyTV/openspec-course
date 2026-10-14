import type { Currency } from "@/contexts/shared/domain/Money";
import type { UserId } from "@/contexts/shared/domain/UserId";

import type { CustomerNames } from "../domain/CustomerDirectory";
import type { Order } from "../domain/Order";

export type OrderResponse = {
	id: string;
	createdAt: string;
	status: string;
	customerName: string;
	subtotalAmount: number;
	currency: Currency;
	items: number;
};

export function toOrderResponse(
	order: Order,
	customerNames: CustomerNames,
): OrderResponse {
	return {
		id: order.id.value,
		createdAt: order.createdAt.toISOString(),
		status: order.status,
		customerName: customerNames.nameOf(order.userId),
		subtotalAmount: order.subtotal.amount,
		currency: order.subtotal.currency,
		items: order.items(),
	};
}

export function customersOf(orders: Order[]): UserId[] {
	return orders.map((order) => order.userId);
}
