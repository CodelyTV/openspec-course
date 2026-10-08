import type { IdGenerator } from "@/contexts/shared/domain/IdGenerator";
import { ProductId } from "@/contexts/shared/domain/ProductId";

import { Outfit } from "../../domain/Outfit";
import { OutfitId } from "../../domain/OutfitId";
import type { OutfitRepository } from "../../domain/OutfitRepository";
import type { ProductRepository } from "../../domain/ProductRepository";
import { ensureOutfitCanBeSaved } from "../ensureOutfitCanBeSaved";

export class OutfitCreator {
	constructor(
		private readonly outfitRepository: OutfitRepository,
		private readonly productRepository: ProductRepository,
		private readonly idGenerator: IdGenerator,
	) {}

	async create(name: string, productIds: string[]): Promise<void> {
		const outfit = Outfit.create(
			new OutfitId(this.idGenerator.generate()),
			name,
			productIds.map((productId) => new ProductId(productId)),
		);

		await ensureOutfitCanBeSaved(
			outfit,
			this.outfitRepository,
			this.productRepository,
		);

		await this.outfitRepository.save(outfit);
	}
}
