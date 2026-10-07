import type {
	VariantResponse,
	VariantsSearcher,
} from "@/contexts/backend/products/application/search-variants/VariantsSearcher";
import type { VariantId } from "@/contexts/shared/domain/VariantId";

import { CatalogItem } from "../domain/CatalogItem";
import { CheckoutCatalog } from "../domain/CheckoutCatalog";

export class ProductsCheckoutCatalog extends CheckoutCatalog {
	constructor(private readonly variantsSearcher: VariantsSearcher) {
		super();
	}

	async searchItems(variantIds: VariantId[]): Promise<CatalogItem[]> {
		const variants = await this.variantsSearcher.search(
			variantIds.map((variantId) => variantId.value),
		);

		return variants.map(toCatalogItem);
	}
}

function toCatalogItem(variant: VariantResponse): CatalogItem {
	return CatalogItem.fromPrimitives({
		productId: variant.productId,
		variantId: variant.variantId,
		productName: variant.productName,
		color: variant.color,
		size: variant.size,
		unitPrice: variant.price,
		unitsLeft: variant.onlineStock,
	});
}
