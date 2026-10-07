import { ProductId } from "@/contexts/shared/domain/ProductId";

import { InvalidOutfitPiecesCountError } from "./errors/InvalidOutfitPiecesCountError";
import { RepeatedOutfitProductError } from "./errors/RepeatedOutfitProductError";
import { OutfitId } from "./OutfitId";
import { OutfitName } from "./OutfitName";

export type OutfitPrimitives = {
	id: string;
	name: string;
	productIds: string[];
};
export class Outfit {
	readonly productIds: readonly ProductId[];
	constructor(
		public readonly id: OutfitId,
		public readonly name: OutfitName,
		productIds: ProductId[],
	) {
		if (productIds.length < 2 || productIds.length > 4) {
			throw new InvalidOutfitPiecesCountError();
		}
		const seen = new Set<string>();
		for (const id of productIds) {
			if (seen.has(id.value)) {
				throw new RepeatedOutfitProductError(id.value);
			}
			seen.add(id.value);
		}
		this.productIds = [...productIds];
	}

	static fromPrimitives(primitives: OutfitPrimitives): Outfit {
		return new Outfit(
			new OutfitId(primitives.id),
			new OutfitName(primitives.name),
			primitives.productIds.map((id) => new ProductId(id)),
		);
	}

	toPrimitives(): OutfitPrimitives {
		return {
			id: this.id.value,
			name: this.name.value,
			productIds: this.productIds.map((id) => id.value),
		};
	}
}
