import type { ProductId } from "@/contexts/shared/domain/ProductId";
import type { UserId } from "@/contexts/shared/domain/UserId";

export abstract class PurchaseHistory {
	abstract hasBought(userId: UserId, productId: ProductId): Promise<boolean>;
}
