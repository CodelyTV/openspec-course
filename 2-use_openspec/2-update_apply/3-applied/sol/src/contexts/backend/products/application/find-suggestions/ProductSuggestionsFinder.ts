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
		if (outfits.length === 0) {
			const related = await this.products.searchOthersSameCollectionFirst(
				product,
				4,
			);

			return {
				kind: "collection",
				products: related.map(toProductResponse),
			};
		}
		const ids = [
			...new Map(
				outfits
					.flatMap((outfit) => outfit.productIds)
					.map((productId) => [productId.value, productId]),
			).values(),
		];
		const pieces = await this.products.searchByIds(ids);
		const byId = new Map(pieces.map((piece) => [piece.id.value, piece]));

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
