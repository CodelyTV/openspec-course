import type { MoneyPrimitives } from "@/contexts/shared/domain/Money";
import { VariantId } from "@/contexts/shared/domain/VariantId";

import type { Product } from "../../domain/Product";
import type { ProductRepository } from "../../domain/ProductRepository";
import type { ProductVariant, Size } from "../../domain/ProductVariant";

export type VariantResponse = {
	productId: string;
	productName: string;
	variantId: string;
	color: string;
	size: Size;
	price: MoneyPrimitives;
	onlineStock: number;
};

export class VariantsSearcher {
	constructor(private readonly repository: ProductRepository) {}

	async search(rawVariantIds: string[]): Promise<VariantResponse[]> {
		const variantIds = rawVariantIds.map((id) => new VariantId(id));
		const products = await this.repository.searchByVariantIds(variantIds);

		return products.flatMap((product) =>
			product.variants
				.filter((variant) =>
					variantIds.some((wanted) => variant.id.equals(wanted)),
				)
				.map((variant) => toVariantResponse(product, variant)),
		);
	}
}

function toVariantResponse(
	product: Product,
	variant: ProductVariant,
): VariantResponse {
	return {
		productId: product.id.value,
		productName: product.name,
		variantId: variant.id.value,
		color: variant.color,
		size: variant.size,
		price: product.price.toPrimitives(),
		onlineStock: variant.onlineStock,
	};
}
