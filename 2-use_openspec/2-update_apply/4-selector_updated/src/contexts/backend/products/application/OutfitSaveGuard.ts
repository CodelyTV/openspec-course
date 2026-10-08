import { OutfitNameAlreadyExistsError } from "../domain/errors/OutfitNameAlreadyExistsError";
import { OutfitProductNotFoundError } from "../domain/errors/OutfitProductNotFoundError";
import type { Outfit } from "../domain/Outfit";
import type { OutfitRepository } from "../domain/OutfitRepository";
import type { ProductRepository } from "../domain/ProductRepository";

export class OutfitSaveGuard {
	constructor(
		private readonly outfitRepository: OutfitRepository,
		private readonly productRepository: ProductRepository,
	) {}

	async ensureCanBeSaved(outfit: Outfit): Promise<void> {
		await this.ensureNameIsNotTakenByAnotherOutfit(outfit);
		await this.ensureEveryProductIsInTheCatalog(outfit);
	}

	private async ensureNameIsNotTakenByAnotherOutfit(
		outfit: Outfit,
	): Promise<void> {
		const outfitWithThatName = await this.outfitRepository.searchByName(
			outfit.name,
		);
		const isTakenByAnotherOutfit =
			outfitWithThatName !== null &&
			!outfitWithThatName.id.equals(outfit.id);

		if (isTakenByAnotherOutfit) {
			throw new OutfitNameAlreadyExistsError(outfit.name);
		}
	}

	private async ensureEveryProductIsInTheCatalog(
		outfit: Outfit,
	): Promise<void> {
		const products = await this.productRepository.searchByIds(
			outfit.productIds,
		);
		const missingProductId = outfit.productIds.find(
			(productId) =>
				!products.some((product) => product.id.equals(productId)),
		);

		if (missingProductId) {
			throw new OutfitProductNotFoundError(missingProductId.value);
		}
	}
}
