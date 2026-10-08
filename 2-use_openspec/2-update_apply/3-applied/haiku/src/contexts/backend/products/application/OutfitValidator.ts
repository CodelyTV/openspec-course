import { OutfitNameAlreadyExistsError } from "../domain/errors/OutfitNameAlreadyExistsError";
import { OutfitProductNotFoundError } from "../domain/errors/OutfitProductNotFoundError";
import type { Outfit } from "../domain/Outfit";
import type { OutfitRepository } from "../domain/OutfitRepository";
import type { ProductRepository } from "../domain/ProductRepository";

export class OutfitValidator {
	constructor(
		private readonly outfitRepository: OutfitRepository,
		private readonly productRepository: ProductRepository,
	) {}

	async ensureCanBeSaved(outfit: Outfit): Promise<void> {
		await this.ensureNameIsAvailable(outfit);
		await this.ensureProductsExist(outfit);
	}

	private async ensureNameIsAvailable(outfit: Outfit): Promise<void> {
		const outfitWithSameName = await this.outfitRepository.searchByName(
			outfit.name,
		);

		if (outfitWithSameName && !outfitWithSameName.id.equals(outfit.id)) {
			throw new OutfitNameAlreadyExistsError(outfit.name);
		}
	}

	private async ensureProductsExist(outfit: Outfit): Promise<void> {
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
