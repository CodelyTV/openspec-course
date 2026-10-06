import type { CustomerDirectory } from "../../domain/CustomerDirectory";
import type { OrderRepository } from "../../domain/OrderRepository";
import {
	customersOf,
	type OrderResponse,
	toOrderResponse,
} from "../OrderResponse";

export class OrdersLister {
	constructor(
		private readonly repository: OrderRepository,
		private readonly customerDirectory: CustomerDirectory,
	) {}

	async list(): Promise<OrderResponse[]> {
		const orders = await this.repository.searchAll();
		const customerNames = await this.customerDirectory.namesOf(
			customersOf(orders),
		);

		return orders.map((order) => toOrderResponse(order, customerNames));
	}
}
