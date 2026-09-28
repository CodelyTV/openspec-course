import type { Product } from "./Product";
import type { ProductId } from "./ProductId";
import type { VariantId } from "./VariantId";

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
}
