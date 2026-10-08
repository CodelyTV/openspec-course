import { ProductId } from "@/contexts/shared/domain/ProductId";

import type { OutfitRepository } from "../../domain/OutfitRepository";
import type { ProductRepository } from "../../domain/ProductRepository";
import { type ProductResponse, toProductResponse } from "../ProductResponse";

export type OutfitSuggestionResponse = {
	name: string;
	products: ProductResponse[];
};
export type ProductSuggestionsResponse =
	| { kind: "outfits"; outfits: OutfitSuggestionResponse[] }
	| { kind: "collection"; products: ProductResponse[] };

export class ProductSuggestionsFinder {
	constructor(
		private readonly products: ProductRepository,
		private readonly outfits: OutfitRepository,
	) {}

	async find(id: string): Promise<ProductSuggestionsResponse> {
		const product = await this.products.search(new ProductId(id));
		if (!product) {
			return { kind: "collection", products: [] };
		}
		const outfits = (await this.outfits.searchContaining(product.id))
			.filter((outfit) => outfit.isDisplayable())
			.sort((a, b) => a.name.localeCompare(b.name));
		if (!outfits.length) {
			return {
				kind: "collection",
				products: (
					await this.products.searchOthersSameCollectionFirst(
						product,
						4,
					)
				).map(toProductResponse),
			};
		}
		const found = await this.products.searchByIds(
			outfits.flatMap((outfit) => outfit.productIds),
		);
		const byId = new Map(found.map((piece) => [piece.id.value, piece]));

		return {
			kind: "outfits",
			outfits: outfits.map((outfit) => ({
				name: outfit.name,
				products: outfit.productIds.flatMap((productId) => {
					const piece = byId.get(productId.value);

					return piece ? [toProductResponse(piece)] : [];
				}),
			})),
		};
	}
}
