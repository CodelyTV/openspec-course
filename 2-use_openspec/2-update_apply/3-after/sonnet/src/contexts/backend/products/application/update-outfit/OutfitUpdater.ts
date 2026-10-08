import { ProductId } from "@/contexts/shared/domain/ProductId";

import { OutfitNotFoundError } from "../../domain/errors/OutfitNotFoundError";
import { Outfit } from "../../domain/Outfit";
import { OutfitId } from "../../domain/OutfitId";
import type { OutfitRepository } from "../../domain/OutfitRepository";
import type { ProductRepository } from "../../domain/ProductRepository";
import { ensureOutfitCanBeSaved } from "../ensureOutfitCanBeSaved";

export class OutfitUpdater {
	constructor(
		private readonly outfitRepository: OutfitRepository,
		private readonly productRepository: ProductRepository,
	) {}

	async update(
		id: string,
		name: string,
		productIds: string[],
	): Promise<void> {
		const outfitId = new OutfitId(id);

		if (!(await this.outfitRepository.search(outfitId))) {
			throw new OutfitNotFoundError(id);
		}

		const outfit = Outfit.create(
			outfitId,
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
