import type { OutfitRepository } from "../../domain/OutfitRepository";
import type { ProductRepository } from "../../domain/ProductRepository";
import type { OutfitSummaryResponse } from "../OutfitResponse";

export class OutfitsLister {
	constructor(
		private readonly outfitRepository: OutfitRepository,
		private readonly productRepository: ProductRepository,
	) {}

	async list(): Promise<OutfitSummaryResponse[]> {
		const outfits = await this.outfitRepository.searchAll();
		const products = await this.productRepository.searchByIds(
			outfits.flatMap((outfit) => outfit.productIds),
		);
		const productsById = new Map(
			products.map((product) => [product.id.value, product]),
		);

		return outfits
			.map((outfit) => ({
				id: outfit.id.value,
				name: outfit.name,
				productCount: outfit.productIds.length,
				outOfStockProductNames: outfit.productIds.flatMap(
					(productId) => {
						const product = productsById.get(productId.value);

						return product?.isOutOfStock() ? [product.name] : [];
					},
				),
			}))
			.sort((a, b) => a.name.localeCompare(b.name));
	}
}
