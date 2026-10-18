import type { CurrentUserProvider } from "@/contexts/shared/domain/CurrentUserProvider";

import type { ProductRepository } from "../../domain/ProductRepository";
import type { WishlistRepository } from "../../domain/WishlistRepository";
import { type ProductResponse, toProductResponse } from "../ProductResponse";

export class CustomerWishlistLister {
	constructor(
		private readonly wishlistRepository: WishlistRepository,
		private readonly productRepository: ProductRepository,
		private readonly currentUserProvider: CurrentUserProvider,
	) {}

	async list(): Promise<ProductResponse[]> {
		const savedProductIds =
			await this.wishlistRepository.searchProductIdsOf(
				await this.currentUserProvider.currentUserId(),
			);

		if (savedProductIds.length === 0) {
			return [];
		}

		const products =
			await this.productRepository.searchByIds(savedProductIds);
		const savedOrder = savedProductIds.map((productId) => productId.value);

		return products
			.toSorted(
				(a, b) =>
					savedOrder.indexOf(a.id.value) -
					savedOrder.indexOf(b.id.value),
			)
			.map(toProductResponse);
	}
}
