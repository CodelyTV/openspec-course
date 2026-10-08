import { ProductId } from "@/contexts/shared/domain/ProductId";

import { OutfitNameAlreadyExistsError } from "../domain/errors/OutfitNameAlreadyExistsError";
import { OutfitProductNotFoundError } from "../domain/errors/OutfitProductNotFoundError";
import type { Outfit } from "../domain/Outfit";
import type { OutfitRepository } from "../domain/OutfitRepository";
import type { ProductRepository } from "../domain/ProductRepository";

export async function ensureOutfitCanBeSaved(
	outfit: Outfit,
	outfitRepository: OutfitRepository,
	productRepository: ProductRepository,
): Promise<void> {
	await ensureProductsExist(outfit.productIds, productRepository);

	const outfitWithSameName = await outfitRepository.searchByName(outfit.name);

	if (outfitWithSameName && !outfitWithSameName.id.equals(outfit.id)) {
		throw new OutfitNameAlreadyExistsError(outfit.name);
	}
}

async function ensureProductsExist(
	productIds: ProductId[],
	productRepository: ProductRepository,
): Promise<void> {
	const existingProducts = await productRepository.searchByIds(productIds);
	const existingIds = existingProducts.map((product) => product.id);

	const missingProductId = productIds.find(
		(productId) => !existingIds.some((id) => id.equals(productId)),
	);

	if (missingProductId) {
		throw new OutfitProductNotFoundError(missingProductId.value);
	}
}
