import type { UserRepository } from "@/contexts/backend/users/domain/UserRepository";
import type { Currency } from "@/contexts/shared/domain/Money";

import type { OrderRepository } from "../../domain/OrderRepository";

export type OrderResponse = {
	id: string;
	createdAt: string;
	status: string;
	customerName: string;
	subtotalAmount: number;
	currency: Currency;
	items: number;
};

export class OrdersLister {
	constructor(
		private readonly repository: OrderRepository,
		private readonly userRepository: UserRepository,
	) {}

	async list(): Promise<OrderResponse[]> {
		const [orders, users] = await Promise.all([
			this.repository.searchAll(),
			this.userRepository.searchAll(),
		]);
		const nameByUserId = new Map(
			users.map((user) => [user.id.value, user.name]),
		);

		return orders.map((order) => ({
			id: order.id.value,
			createdAt: order.createdAt.toISOString(),
			status: order.status,
			customerName:
				nameByUserId.get(order.userId.value) ?? order.userId.value,
			subtotalAmount: order.subtotal.amount,
			currency: order.subtotal.currency,
			items: order.items(),
		}));
	}
}
