import type { ProductId } from "@/contexts/shared/domain/ProductId";

export abstract class OutfitCatalog {
	abstract searchExistingProductIds(ids: ProductId[]): Promise<ProductId[]>;
}
