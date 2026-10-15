import type { ProductFinder } from "@/contexts/backend/products/application/find/ProductFinder";
import type { ProductId } from "@/contexts/shared/domain/ProductId";

import { ReviewedProducts } from "../domain/ReviewedProducts";

export class ProductsReviewedProducts extends ReviewedProducts {
	constructor(private readonly productFinder: ProductFinder) {
		super();
	}

	async nameOf(productId: ProductId): Promise<string | null> {
		const product = await this.productFinder.find(productId.value);

		return product?.name ?? null;
	}
}
