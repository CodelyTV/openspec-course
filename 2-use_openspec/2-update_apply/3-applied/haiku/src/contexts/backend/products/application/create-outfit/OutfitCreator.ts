import type { IdGenerator } from "@/contexts/shared/domain/IdGenerator";
import { ProductId } from "@/contexts/shared/domain/ProductId";

import { Outfit } from "../../domain/Outfit";
import { OutfitId } from "../../domain/OutfitId";
import type { OutfitRepository } from "../../domain/OutfitRepository";
import type { ProductRepository } from "../../domain/ProductRepository";
import { OutfitValidator } from "../OutfitValidator";

export class OutfitCreator {
	private readonly validator: OutfitValidator;

	constructor(
		private readonly outfitRepository: OutfitRepository,
		productRepository: ProductRepository,
		private readonly idGenerator: IdGenerator,
	) {
		this.validator = new OutfitValidator(
			outfitRepository,
			productRepository,
		);
	}

	async create(name: string, productIds: string[]): Promise<void> {
		const outfit = Outfit.create(
			new OutfitId(this.idGenerator.generate()),
			name,
			productIds.map((productId) => new ProductId(productId)),
		);

		await this.validator.ensureCanBeSaved(outfit);
		await this.outfitRepository.save(outfit);
	}
}
