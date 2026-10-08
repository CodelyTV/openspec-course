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
		if (await this.outfits.searchByName(outfit.name)) {
			throw new OutfitNameAlreadyExistsError();
		}
		const found = await this.products.searchByIds(outfit.productIds);
		if (found.length !== outfit.productIds.length) {
			throw new OutfitProductNotFoundError();
		}
		await this.outfits.save(outfit);
	}
}
