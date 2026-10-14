import type { ProductId } from "@/contexts/shared/domain/ProductId";
import type { VariantId } from "@/contexts/shared/domain/VariantId";

import type { Product } from "./Product";

export type ProductCriteria = {
	collection?: string;
	category?: string;
};

export abstract class ProductRepository {
	abstract searchAll(): Promise<Product[]>;

	abstract searchMatching(criteria: ProductCriteria): Promise<Product[]>;

	abstract search(id: ProductId): Promise<Product | null>;

	abstract searchByIds(ids: ProductId[]): Promise<Product[]>;

	abstract searchByVariantId(variantId: VariantId): Promise<Product | null>;

	abstract searchByVariantIds(variantIds: VariantId[]): Promise<Product[]>;

	abstract searchOthersSameCollectionFirst(
		product: Product,
		limit: number,
	): Promise<Product[]>;

	abstract searchCategories(): Promise<string[]>;

	abstract searchCollections(): Promise<string[]>;

	abstract decreaseStockIfEnoughUnitsLeft(
		variantId: VariantId,
		quantity: number,
	): Promise<boolean>;

	abstract increaseStock(
		variantId: VariantId,
		quantity: number,
	): Promise<void>;
}
