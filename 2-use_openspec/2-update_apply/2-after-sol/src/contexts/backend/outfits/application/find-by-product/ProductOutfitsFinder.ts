import { ProductId } from "@/contexts/shared/domain/ProductId";

import type { OutfitRepository } from "../../domain/OutfitRepository";
import type { OutfitResponse } from "../OutfitResponse";

export class ProductOutfitsFinder {
	constructor(private readonly repository: OutfitRepository) {}
	async find(productId: string): Promise<OutfitResponse[]> {
		const outfits = await this.repository.searchContaining(
			new ProductId(productId),
		);

		return outfits
			.map((outfit) => outfit.toPrimitives())
			.sort((a, b) => a.name.localeCompare(b.name));
	}
}
