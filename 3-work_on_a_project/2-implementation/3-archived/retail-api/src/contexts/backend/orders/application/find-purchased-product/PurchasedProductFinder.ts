import { UserId } from "@/contexts/shared/domain/UserId";

import type { Order } from "../../domain/Order";
import type { OrderRepository } from "../../domain/OrderRepository";

export type PurchasedProductResponse = {
	productId: string;
	productName: string;
};

function newestFirst(orders: Order[]): Order[] {
	return [...orders].sort(
		(first, second) =>
			second.createdAt.getTime() - first.createdAt.getTime(),
	);
}

export class PurchasedProductFinder {
	constructor(private readonly repository: OrderRepository) {}

	async find(
		userId: string,
		productId: string,
	): Promise<PurchasedProductResponse | null> {
		const orders = await this.repository.searchByUser(new UserId(userId));

		const lineOfTheMostRecentPurchase = newestFirst(orders)
			.flatMap((order) => order.lines)
			.find((line) => line.productId === productId);

		if (!lineOfTheMostRecentPurchase) {
			return null;
		}

		return {
			productId: lineOfTheMostRecentPurchase.productId,
			productName: lineOfTheMostRecentPurchase.productName,
		};
	}
}
