import type { CurrentUserProvider } from "@/contexts/shared/domain/CurrentUserProvider";
import { ProductId } from "@/contexts/shared/domain/ProductId";

import type { ProductRepository } from "../../domain/ProductRepository";
import type { RestockAlertRepository } from "../../domain/RestockAlertRepository";

export class CustomerRestockAlertsFinder {
	constructor(
		private readonly restockAlertRepository: RestockAlertRepository,
		private readonly productRepository: ProductRepository,
		private readonly currentUserProvider: CurrentUserProvider,
	) {}

	async find(productId: string): Promise<string[]> {
		const product = await this.productRepository.search(
			new ProductId(productId),
		);

		if (!product) {
			return [];
		}

		const alertedVariantIds =
			await this.restockAlertRepository.searchVariantIdsOf(
				await this.currentUserProvider.currentUserId(),
				product.variants.map((variant) => variant.id),
			);

		return alertedVariantIds.map((variantId) => variantId.value);
	}
}
