import type { CurrentUserProvider } from "@/contexts/shared/domain/CurrentUserProvider";
import { ProductId } from "@/contexts/shared/domain/ProductId";

import type { WishlistRepository } from "../../domain/WishlistRepository";

export class WishlistProductChecker {
	constructor(
		private readonly wishlistRepository: WishlistRepository,
		private readonly currentUserProvider: CurrentUserProvider,
	) {}

	async isSaved(productId: string): Promise<boolean> {
		return this.wishlistRepository.has(
			await this.currentUserProvider.currentUserId(),
			new ProductId(productId),
		);
	}
}
