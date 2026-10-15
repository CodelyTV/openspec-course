import { ProductId } from "@/contexts/shared/domain/ProductId";
import { UserId } from "@/contexts/shared/domain/UserId";

import type { OrderRepository } from "../../domain/OrderRepository";

export class ProductPurchaseChecker {
	constructor(private readonly repository: OrderRepository) {}

	async hasBought(userId: string, productId: string): Promise<boolean> {
		const orders = await this.repository.searchByUser(new UserId(userId));
		const product = new ProductId(productId);

		return orders.some((order) => order.includesProduct(product));
	}
}
