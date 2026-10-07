import { OutfitNameAlreadyExistsError } from "../../domain/errors/OutfitNameAlreadyExistsError";
import { OutfitNotFoundError } from "../../domain/errors/OutfitNotFoundError";
import { OutfitProductNotFoundError } from "../../domain/errors/OutfitProductNotFoundError";
import { Outfit } from "../../domain/Outfit";
import type { OutfitCatalog } from "../../domain/OutfitCatalog";
import { OutfitId } from "../../domain/OutfitId";
import type { OutfitRepository } from "../../domain/OutfitRepository";

export class OutfitUpdater {
	constructor(
		private readonly repository: OutfitRepository,
		private readonly catalog: OutfitCatalog,
	) {}

	async update(
		id: string,
		name: string,
		productIds: string[],
	): Promise<void> {
		if (!(await this.repository.search(new OutfitId(id)))) {
			throw new OutfitNotFoundError(id);
		}
		const outfit = Outfit.fromPrimitives({ id, name, productIds });
		const existingIds = await this.catalog.searchExistingProductIds([
			...outfit.productIds,
		]);
		const missing = outfit.productIds.find(
			(id) => !existingIds.some((existing) => existing.equals(id)),
		);
		if (missing) {
			throw new OutfitProductNotFoundError(missing.value);
		}
		const owner = await this.repository.searchByName(outfit.name);
		if (owner && !owner.id.equals(outfit.id)) {
			throw new OutfitNameAlreadyExistsError(name);
		}
		await this.repository.save(outfit);
	}
}
