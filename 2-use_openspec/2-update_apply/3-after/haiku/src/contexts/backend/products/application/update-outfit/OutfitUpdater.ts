import { ProductId } from "@/contexts/shared/domain/ProductId";

import { OutfitNotFoundError } from "../../domain/errors/OutfitNotFoundError";
import { Outfit } from "../../domain/Outfit";
import { OutfitId } from "../../domain/OutfitId";
import type { OutfitRepository } from "../../domain/OutfitRepository";
import type { ProductRepository } from "../../domain/ProductRepository";
import { OutfitValidator } from "../OutfitValidator";

export class OutfitUpdater {
	private readonly validator: OutfitValidator;

	constructor(
		private readonly outfitRepository: OutfitRepository,
		productRepository: ProductRepository,
	) {
		this.validator = new OutfitValidator(
			outfitRepository,
			productRepository,
		);
	}

	async update(
		id: string,
		name: string,
		productIds: string[],
	): Promise<void> {
		const outfitId = new OutfitId(id);
		const outfit = Outfit.create(
			outfitId,
			name,
			productIds.map((productId) => new ProductId(productId)),
		);

		if (!(await this.outfitRepository.search(outfitId))) {
			throw new OutfitNotFoundError(id);
		}

		await this.validator.ensureCanBeSaved(outfit);
		await this.outfitRepository.save(outfit);
	}
}
