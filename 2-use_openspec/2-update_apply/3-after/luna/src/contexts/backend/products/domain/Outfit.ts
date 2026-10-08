import { CodelyError } from "@/contexts/shared/domain/CodelyError";
import { ProductId } from "@/contexts/shared/domain/ProductId";

import { OutfitId } from "./OutfitId";

export type OutfitPrimitives = {
	id: string;
	name: string;
	productIds: string[];
};

export class InvalidOutfitNameError extends CodelyError {}
export class InvalidOutfitSizeError extends CodelyError {}
export class RepeatedOutfitProductError extends CodelyError {}

export class Outfit {
	private constructor(
		readonly id: OutfitId,
		readonly name: string,
		readonly productIds: ProductId[],
	) {}

	static create(id: OutfitId, name: string, productIds: ProductId[]): Outfit {
		if (!name.trim()) {
			throw new InvalidOutfitNameError("Outfit name is required");
		}
		if (productIds.length < 2 || productIds.length > 4) {
			throw new InvalidOutfitSizeError(
				"An outfit needs between 2 and 4 products",
			);
		}
		if (
			new Set(productIds.map((productId) => productId.value)).size !==
			productIds.length
		) {
			throw new RepeatedOutfitProductError(
				"A product can only appear once in an outfit",
			);
		}

		return new Outfit(id, name.trim(), productIds);
	}

	static fromPrimitives(primitives: OutfitPrimitives): Outfit {
		return new Outfit(
			new OutfitId(primitives.id),
			primitives.name,
			primitives.productIds.map((id) => new ProductId(id)),
		);
	}

	isDisplayable(): boolean {
		return this.productIds.length >= 2;
	}

	toPrimitives(): OutfitPrimitives {
		return {
			id: this.id.value,
			name: this.name,
			productIds: this.productIds.map((id) => id.value),
		};
	}
}
