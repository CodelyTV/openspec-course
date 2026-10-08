import type { ProductResponse } from "@/contexts/backend/products/application/ProductResponse";

import type { OutfitProductOption } from "./OutfitForm";

export function productOptionsOf(
	products: ProductResponse[],
): OutfitProductOption[] {
	return products.map((product) => ({ id: product.id, name: product.name }));
}
