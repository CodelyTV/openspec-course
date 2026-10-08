import type { OutfitRepository } from "../../domain/OutfitRepository";
import type { ProductRepository } from "../../domain/ProductRepository";

export type OutfitSummaryResponse = {
	id: string;
	name: string;
	productCount: number;
	outOfStockProductNames: string[];
};

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

		return outfits
			.map((outfit) => ({
				id: outfit.id.value,
				name: outfit.name,
				productCount: outfit.productIds.length,
				outOfStockProductNames: outfit.productIds.flatMap(
					(productId) => {
						const product = products.find((candidate) =>
							candidate.id.equals(productId),
						);

						return product?.isOutOfStock() ? [product.name] : [];
					},
				),
			}))
			.sort((a, b) => a.name.localeCompare(b.name));
	}
}
