import { ProductId } from "@/contexts/shared/domain/ProductId";

import {
	InvalidOutfitNameError,
	InvalidOutfitSizeError,
	RepeatedOutfitProductError,
} from "./errors/OutfitErrors";
import { OutfitId } from "./OutfitId";

export type OutfitPrimitives = {
	id: string;
	name: string;
	productIds: string[];
};

export class Outfit {
	private constructor(
		readonly id: OutfitId,
		readonly name: string,
		readonly productIds: ProductId[],
	) {}

	static create(id: OutfitId, name: string, productIds: ProductId[]): Outfit {
		const trimmedName = name.trim();
		if (!trimmedName) {
			throw new InvalidOutfitNameError();
		}
		if (productIds.length < 2 || productIds.length > 4) {
			throw new InvalidOutfitSizeError();
		}
		if (
			new Set(productIds.map((id) => id.value)).size !== productIds.length
		) {
			throw new RepeatedOutfitProductError();
		}

		return new Outfit(id, trimmedName, productIds);
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
