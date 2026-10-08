import { ProductId } from "@/contexts/shared/domain/ProductId";

import type { OutfitRepository } from "../../domain/OutfitRepository";
import type { ProductRepository } from "../../domain/ProductRepository";
import { type ProductResponse, toProductResponse } from "../ProductResponse";

const collectionSuggestionsShown = 4;

export type OutfitSuggestionResponse = {
	name: string;
	products: ProductResponse[];
};

export type ProductSuggestionsResponse =
	| { kind: "outfits"; outfits: OutfitSuggestionResponse[] }
	| { kind: "collection"; products: ProductResponse[] };

export class ProductSuggestionsFinder {
	constructor(
		private readonly productRepository: ProductRepository,
		private readonly outfitRepository: OutfitRepository,
	) {}

	async find(productId: string): Promise<ProductSuggestionsResponse> {
		const product = await this.productRepository.search(
			new ProductId(productId),
		);

		if (!product) {
			return { kind: "collection", products: [] };
		}

		const displayableOutfits = (
			await this.outfitRepository.searchContaining(product.id)
		)
			.filter((outfit) => outfit.isDisplayable())
			.sort((a, b) => a.name.localeCompare(b.name));

		if (displayableOutfits.length === 0) {
			const related =
				await this.productRepository.searchOthersSameCollectionFirst(
					product,
					collectionSuggestionsShown,
				);

			return {
				kind: "collection",
				products: related.map(toProductResponse),
			};
		}

		const products = await this.productRepository.searchByIds(
			displayableOutfits.flatMap((outfit) => outfit.productIds),
		);

		return {
			kind: "outfits",
			outfits: displayableOutfits.map((outfit) => ({
				name: outfit.name,
				products: outfit.productIds.flatMap((outfitProductId) => {
					const outfitProduct = products.find((candidate) =>
						candidate.id.equals(outfitProductId),
					);

					return outfitProduct
						? [toProductResponse(outfitProduct)]
						: [];
				}),
			})),
		};
	}
}
