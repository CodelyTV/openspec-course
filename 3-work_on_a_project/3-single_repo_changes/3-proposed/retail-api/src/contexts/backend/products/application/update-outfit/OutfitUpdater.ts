import { ProductId } from "@/contexts/shared/domain/ProductId";

import { OutfitNotFoundError } from "../../domain/errors/OutfitNotFoundError";
import { Outfit } from "../../domain/Outfit";
import { OutfitId } from "../../domain/OutfitId";
import type { OutfitRepository } from "../../domain/OutfitRepository";
import type { ProductRepository } from "../../domain/ProductRepository";
import { OutfitSaveGuard } from "../OutfitSaveGuard";

export class OutfitUpdater {
	private readonly guard: OutfitSaveGuard;

	constructor(
		private readonly outfitRepository: OutfitRepository,
		productRepository: ProductRepository,
	) {
		this.guard = new OutfitSaveGuard(outfitRepository, productRepository);
	}

	async update(
		id: string,
		name: string,
		productIds: string[],
	): Promise<void> {
		const existing = await this.outfitRepository.search(new OutfitId(id));

		if (!existing) {
			throw new OutfitNotFoundError(id);
		}

		const outfit = Outfit.create(
			existing.id,
			name,
			productIds.map((productId) => new ProductId(productId)),
		);

		await this.guard.ensureCanBeSaved(outfit);
		await this.outfitRepository.save(outfit);
	}
}
