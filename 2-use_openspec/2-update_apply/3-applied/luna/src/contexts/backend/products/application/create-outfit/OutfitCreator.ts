import type { IdGenerator } from "@/contexts/shared/domain/IdGenerator";
import { ProductId } from "@/contexts/shared/domain/ProductId";

import {
	OutfitNameAlreadyExistsError,
	OutfitProductNotFoundError,
} from "../../domain/errors/OutfitErrors";
import { Outfit } from "../../domain/Outfit";
import { OutfitId } from "../../domain/OutfitId";
import type { OutfitRepository } from "../../domain/OutfitRepository";
import type { ProductRepository } from "../../domain/ProductRepository";

export class OutfitCreator {
	constructor(
		private readonly outfits: OutfitRepository,
		private readonly products: ProductRepository,
		private readonly ids: IdGenerator,
	) {}

	async create(name: string, productIds: string[]): Promise<void> {
		const outfit = Outfit.create(
			new OutfitId(this.ids.generate()),
			name,
			productIds.map((id) => new ProductId(id)),
		);
		const existing = await this.outfits.searchByName(outfit.name);
		if (existing) {
			throw new OutfitNameAlreadyExistsError(
				"An outfit with that name already exists",
			);
		}
		const found = await this.products.searchByIds(outfit.productIds);
		if (found.length !== outfit.productIds.length) {
			throw new OutfitProductNotFoundError(
				"One of the products is no longer available",
			);
		}
		await this.outfits.save(outfit);
	}
}
