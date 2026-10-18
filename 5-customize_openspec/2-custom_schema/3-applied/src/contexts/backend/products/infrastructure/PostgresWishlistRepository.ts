import { PostgresRepository } from "@/contexts/backend/shared/infrastructure/PostgresRepository";
import { ProductId } from "@/contexts/shared/domain/ProductId";
import type { UserId } from "@/contexts/shared/domain/UserId";

import type { WishlistItem } from "../domain/WishlistItem";
import type {
	WishlistCountByProductId,
	WishlistRepository,
} from "../domain/WishlistRepository";

export class PostgresWishlistRepository
	extends PostgresRepository
	implements WishlistRepository
{
	async save(item: WishlistItem): Promise<void> {
		await this.sql`
			insert into wishlist_items (user_id, product_id, saved_at)
			values (${item.userId.value}, ${item.productId.value}, ${item.savedAt})
			on conflict (user_id, product_id) do nothing
		`;
	}

	async remove(userId: UserId, productId: ProductId): Promise<void> {
		await this.sql`
			delete from wishlist_items
			where user_id = ${userId.value}
				and product_id = ${productId.value}
		`;
	}

	async has(userId: UserId, productId: ProductId): Promise<boolean> {
		const rows = await this.sql`
			select 1
			from wishlist_items
			where user_id = ${userId.value}
				and product_id = ${productId.value}
		`;

		return rows.length > 0;
	}

	async searchProductIdsOf(userId: UserId): Promise<ProductId[]> {
		const rows = await this.sql<Array<{ product_id: string }>>`
			select product_id
			from wishlist_items
			where user_id = ${userId.value}
			order by saved_at desc
		`;

		return rows.map((row) => new ProductId(row.product_id));
	}

	async countByProduct(): Promise<WishlistCountByProductId> {
		const rows = await this.sql<
			Array<{ product_id: string; wishlisted: number }>
		>`
			select product_id, count(*)::integer as wishlisted
			from wishlist_items
			group by product_id
		`;

		return new Map(rows.map((row) => [row.product_id, row.wishlisted]));
	}
}
