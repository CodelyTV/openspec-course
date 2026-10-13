import type { MoneyPrimitives } from "@/contexts/shared/domain/Money";

import type {
	Product,
	ProductAccent,
	ProductColor,
	SizeGuideRow,
} from "../domain/Product";
import type {
	ProductVariant,
	ProductVariantPrimitives,
} from "../domain/ProductVariant";

export type ProductVariantResponse = ProductVariantPrimitives & {
	hasStock: boolean;
	isLowStock: boolean;
};

export type ProductResponse = {
	id: string;
	name: string;
	collection: string;
	category: string;
	description: string;
	price: MoneyPrimitives;
	badges: string[];
	accent: ProductAccent;
	variants: ProductVariantResponse[];
	colors: ProductColor[];
	sizeGuide: SizeGuideRow[];
	totalOnlineStock: number;
	firstAvailableVariantId: string | null;
};

function toProductVariantResponse(
	variant: ProductVariant,
): ProductVariantResponse {
	return {
		...variant.toPrimitives(),
		hasStock: variant.hasStock(),
		isLowStock: variant.isLowStock(),
	};
}

export function toProductResponse(product: Product): ProductResponse {
	return {
		...product.toPrimitives(),
		variants: product.variantsBySize().map(toProductVariantResponse),
		colors: product.colors(),
		sizeGuide: product.sizeGuide(),
		totalOnlineStock: product.totalOnlineStock(),
		firstAvailableVariantId:
			product.firstAvailableVariant()?.id.value ?? null,
	};
}
