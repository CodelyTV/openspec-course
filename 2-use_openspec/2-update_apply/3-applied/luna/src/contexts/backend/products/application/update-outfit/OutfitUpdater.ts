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
			throw new OutfitNotFoundError("The outfit no longer exists");
		}
		const outfit = Outfit.create(
			outfitId,
			name,
			productIds.map((productId) => new ProductId(productId)),
		);
		const existing = await this.outfits.searchByName(outfit.name);
		if (existing && existing.id.value !== id) {
			throw new OutfitNameAlreadyExistsError(
				"An outfit with that name already exists",
			);
		}
		if (
			(await this.products.searchByIds(outfit.productIds)).length !==
			productIds.length
		) {
			throw new OutfitProductNotFoundError(
				"One of the products is no longer available",
			);
		}
		await this.outfits.save(outfit);
	}
}
