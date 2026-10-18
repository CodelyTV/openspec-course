import type { Clock } from "@/contexts/shared/domain/Clock";
import type { CurrentUserProvider } from "@/contexts/shared/domain/CurrentUserProvider";
import { ProductId } from "@/contexts/shared/domain/ProductId";

import { ProductNotFoundError } from "../../domain/errors/ProductNotFoundError";
import type { ProductRepository } from "../../domain/ProductRepository";
import { WishlistItem } from "../../domain/WishlistItem";
import type { WishlistRepository } from "../../domain/WishlistRepository";

export class WishlistProductSaver {
	constructor(
		private readonly wishlistRepository: WishlistRepository,
		private readonly productRepository: ProductRepository,
		private readonly currentUserProvider: CurrentUserProvider,
		private readonly clock: Clock,
	) {}

	async save(productId: string): Promise<void> {
		const savedProductId = new ProductId(productId);
		const product = await this.productRepository.search(savedProductId);

		if (!product) {
			throw new ProductNotFoundError(productId);
		}

		await this.wishlistRepository.save(
			new WishlistItem(
				await this.currentUserProvider.currentUserId(),
				savedProductId,
				this.clock.now(),
			),
		);
	}
}
