import { ProductId } from "@/contexts/shared/domain/ProductId";

import type { Outfit } from "../../domain/Outfit";
import type { OutfitRepository } from "../../domain/OutfitRepository";
import type { Product } from "../../domain/Product";
import type { ProductRepository } from "../../domain/ProductRepository";
import { type ProductResponse, toProductResponse } from "../ProductResponse";

export type OutfitSuggestionResponse = {
	name: string;
	products: ProductResponse[];
};

export type ProductSuggestionsResponse =
	| { kind: "outfits"; outfits: OutfitSuggestionResponse[] }
	| { kind: "collection"; products: ProductResponse[] };

const collectionSuggestionsShown = 4;

const nothingToSuggest: ProductSuggestionsResponse = {
	kind: "collection",
	products: [],
};

export class ProductSuggestionsFinder {
	constructor(
		private readonly outfitRepository: OutfitRepository,
		private readonly productRepository: ProductRepository,
	) {}

	async find(productId: string): Promise<ProductSuggestionsResponse> {
		const product = await this.productRepository.search(
			new ProductId(productId),
		);

		if (!product) {
			return nothingToSuggest;
		}

		const displayableOutfits = (
			await this.outfitRepository.searchContaining(product.id)
		)
			.filter((outfit) => outfit.isDisplayable())
			.sort((a, b) => a.name.localeCompare(b.name));

		if (displayableOutfits.length === 0) {
			return this.collectionSuggestionsFor(product);
		}

		return this.outfitSuggestionsFrom(displayableOutfits);
	}

	private async collectionSuggestionsFor(
		product: Product,
	): Promise<ProductSuggestionsResponse> {
		const others =
			await this.productRepository.searchOthersSameCollectionFirst(
				product,
				collectionSuggestionsShown,
			);

		return { kind: "collection", products: others.map(toProductResponse) };
	}

	private async outfitSuggestionsFrom(
		outfits: Outfit[],
	): Promise<ProductSuggestionsResponse> {
		const products = await this.productRepository.searchByIds(
			outfits.flatMap((outfit) => outfit.productIds),
		);

		return {
			kind: "outfits",
			outfits: outfits.map((outfit) => ({
				name: outfit.name,
				products: outfit.productIds.flatMap((productId) => {
					const piece = products.find((candidate) =>
						candidate.id.equals(productId),
					);

					return piece ? [toProductResponse(piece)] : [];
				}),
			})),
		};
	}
}
