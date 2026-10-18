import type { ProductId } from "@/contexts/shared/domain/ProductId";
import type { UserId } from "@/contexts/shared/domain/UserId";

import type { WishlistItem } from "./WishlistItem";

export type WishlistCountByProductId = Map<string, number>;

export abstract class WishlistRepository {
	abstract save(item: WishlistItem): Promise<void>;

	abstract remove(userId: UserId, productId: ProductId): Promise<void>;

	abstract has(userId: UserId, productId: ProductId): Promise<boolean>;

	abstract searchProductIdsOf(userId: UserId): Promise<ProductId[]>;

	abstract countByProduct(): Promise<WishlistCountByProductId>;
}
