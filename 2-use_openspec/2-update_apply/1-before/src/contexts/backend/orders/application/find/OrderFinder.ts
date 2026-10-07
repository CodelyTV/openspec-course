import type { Currency } from "@/contexts/shared/domain/Money";

import type { CustomerDirectory } from "../../domain/CustomerDirectory";
import { OrderId } from "../../domain/OrderId";
import type { OrderLine } from "../../domain/OrderLine";
import type { OrderRepository } from "../../domain/OrderRepository";

export type OrderDetailLineResponse = {
	productName: string;
	color: string;
	size: string;
	quantity: number;
	unitPriceAmount: number;
};

export type OrderDetailResponse = {
	id: string;
	userId: string;
	customerName: string;
	createdAt: string;
	status: string;
	deliveryMethod: string;
	subtotalAmount: number;
	currency: Currency;
	lines: OrderDetailLineResponse[];
};

export class OrderFinder {
	constructor(
		private readonly orderRepository: OrderRepository,
		private readonly customerDirectory: CustomerDirectory,
	) {}

	async find(id: string): Promise<OrderDetailResponse | null> {
		const isBlankId = id.trim().length === 0;

		if (isBlankId) {
			return null;
		}

		const order = await this.orderRepository.search(new OrderId(id));

		if (!order) {
			return null;
		}

		const customerNames = await this.customerDirectory.namesOf([
			order.userId,
		]);

		const lines = order.lines
			.map((line) => this.toLineResponse(line))
			.sort((a, b) => a.productName.localeCompare(b.productName));

		return {
			id: order.id.value,
			userId: order.userId.value,
			customerName: customerNames.nameOf(order.userId),
			createdAt: order.createdAt.toISOString(),
			status: order.status,
			deliveryMethod: order.deliveryMethod,
			subtotalAmount: order.subtotal.amount,
			currency: order.subtotal.currency,
			lines,
		};
	}

	private toLineResponse(line: OrderLine): OrderDetailLineResponse {
		return {
			productName: line.productName,
			color: line.color,
			size: line.size,
			quantity: line.quantity,
			unitPriceAmount: line.unitPrice.amount,
		};
	}
}
