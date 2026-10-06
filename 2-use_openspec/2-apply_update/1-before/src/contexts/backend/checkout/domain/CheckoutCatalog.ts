import type { VariantId } from "@/contexts/shared/domain/VariantId";

import type { CatalogItem } from "./CatalogItem";

export abstract class CheckoutCatalog {
	abstract searchItems(variantIds: VariantId[]): Promise<CatalogItem[]>;
}
