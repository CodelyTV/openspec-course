import type { IdGenerator } from "@/contexts/shared/domain/IdGenerator";

import { OutfitNameAlreadyExistsError } from "../../domain/errors/OutfitNameAlreadyExistsError";
import { OutfitProductNotFoundError } from "../../domain/errors/OutfitProductNotFoundError";
import { Outfit } from "../../domain/Outfit";
import type { OutfitCatalog } from "../../domain/OutfitCatalog";
import type { OutfitRepository } from "../../domain/OutfitRepository";

export class OutfitCreator {
	constructor(
		private readonly repository: OutfitRepository,
		private readonly idGenerator: IdGenerator,
		private readonly catalog: OutfitCatalog,
	) {}

	async create(name: string, productIds: string[]): Promise<void> {
		const outfit = Outfit.fromPrimitives({
			id: this.idGenerator.generate(),
			name,
			productIds,
		});
		const existingIds = await this.catalog.searchExistingProductIds([
			...outfit.productIds,
		]);
		const missing = outfit.productIds.find(
			(id) => !existingIds.some((existing) => existing.equals(id)),
		);
		if (missing) {
			throw new OutfitProductNotFoundError(missing.value);
		}
		if (await this.repository.searchByName(outfit.name)) {
			throw new OutfitNameAlreadyExistsError(name);
		}
		await this.repository.save(outfit);
	}
}
