import type { PurchasedProductFinder } from "@/contexts/backend/orders/application/find-purchased-product/PurchasedProductFinder";
import type { ProductId } from "@/contexts/shared/domain/ProductId";
import type { UserId } from "@/contexts/shared/domain/UserId";

import {
	type PurchasedProduct,
	PurchaseHistory,
} from "../domain/PurchaseHistory";

export class OrdersPurchaseHistory extends PurchaseHistory {
	constructor(
		private readonly purchasedProductFinder: PurchasedProductFinder,
	) {
		super();
	}

	async purchasedProduct(
		userId: UserId,
		productId: ProductId,
	): Promise<PurchasedProduct | null> {
		return this.purchasedProductFinder.find(userId.value, productId.value);
	}
}
