import type { Outfit } from "../../domain/Outfit";
import type { OutfitRepository } from "../../domain/OutfitRepository";
import type { Product } from "../../domain/Product";
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

		return [...outfits]
			.sort((a, b) => a.name.localeCompare(b.name))
			.map((outfit) => toOutfitSummaryResponse(outfit, products));
	}
}

function toOutfitSummaryResponse(
	outfit: Outfit,
	products: Product[],
): OutfitSummaryResponse {
	const outOfStockProductNames = outfit.productIds.flatMap((productId) => {
		const product = products.find((candidate) =>
			candidate.id.equals(productId),
		);

		return product?.isOutOfStock() ? [product.name] : [];
	});

	return {
		id: outfit.id.value,
		name: outfit.name,
		productCount: outfit.productIds.length,
		outOfStockProductNames,
	};
}
