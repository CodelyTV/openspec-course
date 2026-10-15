import type { ProductPurchaseChecker } from "@/contexts/backend/orders/application/check-purchase/ProductPurchaseChecker";
import type { ProductId } from "@/contexts/shared/domain/ProductId";
import type { UserId } from "@/contexts/shared/domain/UserId";

import { PurchaseHistory } from "../domain/PurchaseHistory";

export class OrdersPurchaseHistory extends PurchaseHistory {
	constructor(
		private readonly productPurchaseChecker: ProductPurchaseChecker,
	) {
		super();
	}

	async hasBought(userId: UserId, productId: ProductId): Promise<boolean> {
		return this.productPurchaseChecker.hasBought(
			userId.value,
			productId.value,
		);
	}
}
