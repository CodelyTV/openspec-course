import type { ProductsByIdsSearcher } from "@/contexts/backend/products/application/search-by-ids/ProductsByIdsSearcher";
import { ProductId } from "@/contexts/shared/domain/ProductId";

import { OutfitCatalog } from "../domain/OutfitCatalog";

export class ProductsOutfitCatalog extends OutfitCatalog {
	constructor(private readonly searcher: ProductsByIdsSearcher) {
		super();
	}

	async searchExistingProductIds(ids: ProductId[]): Promise<ProductId[]> {
		return (await this.searcher.search(ids.map((id) => id.value))).map(
			(product) => new ProductId(product.id),
		);
	}
}
