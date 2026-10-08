import type { ProductId } from "@/contexts/shared/domain/ProductId";
import type { UserId } from "@/contexts/shared/domain/UserId";

export type PurchasedProduct = {
	productId: string;
	productName: string;
};

export abstract class PurchaseHistory {
	abstract purchasedProduct(
		userId: UserId,
		productId: ProductId,
	): Promise<PurchasedProduct | null>;
}
