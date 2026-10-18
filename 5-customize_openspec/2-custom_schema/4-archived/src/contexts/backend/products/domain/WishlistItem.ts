import { ProductId } from "@/contexts/shared/domain/ProductId";
import { UserId } from "@/contexts/shared/domain/UserId";

export type WishlistItemPrimitives = {
	userId: string;
	productId: string;
	savedAt: string;
};

export class WishlistItem {
	constructor(
		readonly userId: UserId,
		readonly productId: ProductId,
		readonly savedAt: Date,
	) {}

	static create(
		userId: UserId,
		productId: ProductId,
		savedAt: Date,
	): WishlistItem {
		return new WishlistItem(userId, productId, savedAt);
	}

	static fromPrimitives(primitives: WishlistItemPrimitives): WishlistItem {
		return new WishlistItem(
			new UserId(primitives.userId),
			new ProductId(primitives.productId),
			new Date(primitives.savedAt),
		);
	}

	toPrimitives(): WishlistItemPrimitives {
		return {
			userId: this.userId.value,
			productId: this.productId.value,
			savedAt: this.savedAt.toISOString(),
		};
	}
}
