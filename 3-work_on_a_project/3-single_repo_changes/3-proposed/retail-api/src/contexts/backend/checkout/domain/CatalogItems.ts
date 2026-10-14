import type { VariantId } from "@/contexts/shared/domain/VariantId";

import { CatalogItemNotFoundError } from "./errors/CatalogItemNotFoundError";
import type { CatalogItem } from "./CatalogItem";

export class CatalogItems {
	constructor(private readonly items: CatalogItem[]) {}

	itemOf(variantId: VariantId): CatalogItem {
		const item = this.items.find((candidate) => candidate.isFor(variantId));

		if (!item) {
			throw new CatalogItemNotFoundError(variantId.value);
		}

		return item;
	}
}
