import type { CurrentUserProvider } from "@/contexts/shared/domain/CurrentUserProvider";
import { ProductId } from "@/contexts/shared/domain/ProductId";

import type { WishlistRepository } from "../../domain/WishlistRepository";

export class WishlistProductRemover {
	constructor(
		private readonly wishlistRepository: WishlistRepository,
		private readonly currentUserProvider: CurrentUserProvider,
	) {}

	async remove(productId: string): Promise<void> {
		await this.wishlistRepository.remove(
			await this.currentUserProvider.currentUserId(),
			new ProductId(productId),
		);
	}
}
