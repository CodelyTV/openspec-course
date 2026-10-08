import { ProductId } from "@/contexts/shared/domain/ProductId";

import {
	OutfitNameAlreadyExistsError,
	OutfitNotFoundError,
	OutfitProductNotFoundError,
} from "../../domain/errors/OutfitErrors";
import { Outfit } from "../../domain/Outfit";
import { OutfitId } from "../../domain/OutfitId";
import type { OutfitRepository } from "../../domain/OutfitRepository";
import type { ProductRepository } from "../../domain/ProductRepository";

export class OutfitUpdater {
	constructor(
		private readonly outfits: OutfitRepository,
		private readonly products: ProductRepository,
	) {}

	async update(
		id: string,
		name: string,
		productIds: string[],
	): Promise<void> {
		const outfitId = new OutfitId(id);
		if (!(await this.outfits.search(outfitId))) {
			throw new OutfitNotFoundError();
		}
		const outfit = Outfit.create(
			outfitId,
			name,
			productIds.map((productId) => new ProductId(productId)),
		);
		const nameMatch = await this.outfits.searchByName(outfit.name);
		if (nameMatch && !nameMatch.id.equals(outfitId)) {
			throw new OutfitNameAlreadyExistsError();
		}
		const found = await this.products.searchByIds(outfit.productIds);
		if (found.length !== outfit.productIds.length) {
			throw new OutfitProductNotFoundError();
		}
		await this.outfits.save(outfit);
	}
}
