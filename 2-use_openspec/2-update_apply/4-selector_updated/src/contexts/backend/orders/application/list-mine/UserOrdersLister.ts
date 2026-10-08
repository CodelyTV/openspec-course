import type { CurrentUserProvider } from "@/contexts/shared/domain/CurrentUserProvider";
import type { Currency } from "@/contexts/shared/domain/Money";

import type { OrderRepository } from "../../domain/OrderRepository";

export type MyOrderResponse = {
	id: string;
	createdAt: string;
	status: string;
	deliveryMethod: string;
	subtotalAmount: number;
	currency: Currency;
	items: number;
};

export class UserOrdersLister {
	constructor(
		private readonly repository: OrderRepository,
		private readonly currentUserProvider: CurrentUserProvider,
	) {}

	async list(): Promise<MyOrderResponse[]> {
		const userId = await this.currentUserProvider.currentUserId();
		const orders = await this.repository.searchByUser(userId);

		return orders.map((order) => ({
			id: order.id.value,
			createdAt: order.createdAt.toISOString(),
			status: order.status,
			deliveryMethod: order.deliveryMethod,
			subtotalAmount: order.subtotal.amount,
			currency: order.subtotal.currency,
			items: order.items(),
		}));
	}
}
