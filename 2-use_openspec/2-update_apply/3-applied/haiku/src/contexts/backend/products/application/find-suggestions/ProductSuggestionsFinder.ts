import { ProductId } from "@/contexts/shared/domain/ProductId";

import type { OutfitRepository } from "../../domain/OutfitRepository";
import type { ProductRepository } from "../../domain/ProductRepository";
import { type ProductResponse, toProductResponse } from "../ProductResponse";

const collectionProductsShown = 4;

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

		const outfits = (
			await this.outfitRepository.searchContaining(product.id)
		)
			.filter((outfit) => outfit.isDisplayable())
			.sort((a, b) => a.name.localeCompare(b.name));

		if (outfits.length === 0) {
			const sameCollection =
				await this.productRepository.searchOthersSameCollectionFirst(
					product,
					collectionProductsShown,
				);

			return {
				kind: "collection",
				products: sameCollection.map(toProductResponse),
			};
		}

		const outfitProducts = await this.productRepository.searchByIds(
			outfits.flatMap((outfit) => outfit.productIds),
		);
		const productsById = new Map(
			outfitProducts.map((outfitProduct) => [
				outfitProduct.id.value,
				outfitProduct,
			]),
		);

		return {
			kind: "outfits",
			outfits: outfits.map((outfit) => ({
				name: outfit.name,
				products: outfit.productIds.flatMap((outfitProductId) => {
					const outfitProduct = productsById.get(
						outfitProductId.value,
					);

					return outfitProduct
						? [toProductResponse(outfitProduct)]
						: [];
				}),
			})),
		};
	}
}
