import type { CurrentUserProvider } from "@/contexts/shared/domain/CurrentUserProvider";

import type { ProductRepository } from "../../domain/ProductRepository";
import type { WishlistRepository } from "../../domain/WishlistRepository";
import { type ProductResponse, toProductResponse } from "../ProductResponse";

export class CustomerWishlistFinder {
	constructor(
		private readonly wishlistRepository: WishlistRepository,
		private readonly productRepository: ProductRepository,
		private readonly currentUserProvider: CurrentUserProvider,
	) {}

	async find(): Promise<ProductResponse[]> {
		const savedProductIds =
			await this.wishlistRepository.searchProductIdsOf(
				await this.currentUserProvider.currentUserId(),
			);

		if (savedProductIds.length === 0) {
			return [];
		}

		const products =
			await this.productRepository.searchByIds(savedProductIds);
		const productsById = new Map(
			products.map((product) => [product.id.value, product]),
		);

		return savedProductIds.flatMap((productId) => {
			const product = productsById.get(productId.value);

			return product ? [toProductResponse(product)] : [];
		});
	}
}
