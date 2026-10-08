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
		private readonly outfits: OutfitRepository,
		private readonly products: ProductRepository,
	) {}

	async list(): Promise<OutfitSummaryResponse[]> {
		const outfits = await this.outfits.searchAll();
		const ids = [
			...new Map(
				outfits
					.flatMap((outfit) => outfit.productIds)
					.map((id) => [id.value, id]),
			).values(),
		];
		const products = ids.length ? await this.products.searchByIds(ids) : [];
		const byId = new Map(
			products.map((product) => [product.id.value, product]),
		);

		return outfits
			.sort((a, b) => a.name.localeCompare(b.name))
			.map((outfit) => ({
				id: outfit.id.value,
				name: outfit.name,
				productCount: outfit.productIds.length,
				outOfStockProductNames: outfit.productIds.flatMap((id) => {
					const product = byId.get(id.value);

					return product?.isOutOfStock() ? [product.name] : [];
				}),
			}));
	}
}
