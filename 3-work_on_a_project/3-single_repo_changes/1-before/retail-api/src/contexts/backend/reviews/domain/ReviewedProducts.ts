import type { ProductId } from "@/contexts/shared/domain/ProductId";

export abstract class ReviewedProducts {
	abstract nameOf(productId: ProductId): Promise<string | null>;
}
