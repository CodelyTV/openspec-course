import { ProductId } from "@/contexts/shared/domain/ProductId";

import { InvalidOutfitNameError } from "./errors/InvalidOutfitNameError";
import { InvalidOutfitSizeError } from "./errors/InvalidOutfitSizeError";
import { RepeatedOutfitProductError } from "./errors/RepeatedOutfitProductError";
import { OutfitId } from "./OutfitId";

export const minProductsPerOutfit = 2;
export const maxProductsPerOutfit = 4;

export type OutfitPrimitives = {
	id: string;
	name: string;
	productIds: string[];
};

export class Outfit {
	constructor(
		readonly id: OutfitId,
		readonly name: string,
		readonly productIds: ProductId[],
	) {}

	static create(id: OutfitId, name: string, productIds: ProductId[]): Outfit {
		const trimmedName = name.trim();

		if (trimmedName.length === 0) {
			throw new InvalidOutfitNameError();
		}

		const hasAllowedSize =
			productIds.length >= minProductsPerOutfit &&
			productIds.length <= maxProductsPerOutfit;

		if (!hasAllowedSize) {
			throw new InvalidOutfitSizeError(
				productIds.length,
				minProductsPerOutfit,
				maxProductsPerOutfit,
			);
		}

		const repeatedProductId = productIds.find((productId, index) =>
			productIds
				.slice(0, index)
				.some((previous) => previous.equals(productId)),
		);

		if (repeatedProductId) {
			throw new RepeatedOutfitProductError(repeatedProductId.value);
		}

		return new Outfit(id, trimmedName, productIds);
	}

	static fromPrimitives(primitives: OutfitPrimitives): Outfit {
		return new Outfit(
			new OutfitId(primitives.id),
			primitives.name,
			primitives.productIds.map((productId) => new ProductId(productId)),
		);
	}

	isDisplayable(): boolean {
		return this.productIds.length >= minProductsPerOutfit;
	}

	toPrimitives(): OutfitPrimitives {
		return {
			id: this.id.value,
			name: this.name,
			productIds: this.productIds.map((productId) => productId.value),
		};
	}
}
