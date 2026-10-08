import { Money, type MoneyPrimitives } from "@/contexts/shared/domain/Money";
import { VariantId } from "@/contexts/shared/domain/VariantId";

export type CatalogItemPrimitives = {
	productId: string;
	variantId: string;
	productName: string;
	color: string;
	size: string;
	unitPrice: MoneyPrimitives;
	unitsLeft: number;
};

export class CatalogItem {
	constructor(
		readonly productId: string,
		readonly variantId: VariantId,
		readonly productName: string,
		readonly color: string,
		readonly size: string,
		readonly unitPrice: Money,
		readonly unitsLeft: number,
	) {}

	static fromPrimitives(primitives: CatalogItemPrimitives): CatalogItem {
		return new CatalogItem(
			primitives.productId,
			new VariantId(primitives.variantId),
			primitives.productName,
			primitives.color,
			primitives.size,
			Money.fromPrimitives(primitives.unitPrice),
			primitives.unitsLeft,
		);
	}

	isFor(variantId: VariantId): boolean {
		return this.variantId.equals(variantId);
	}

	hasStockFor(quantity: number): boolean {
		return this.unitsLeft >= quantity;
	}

	toPrimitives(): CatalogItemPrimitives {
		return {
			productId: this.productId,
			variantId: this.variantId.value,
			productName: this.productName,
			color: this.color,
			size: this.size,
			unitPrice: this.unitPrice.toPrimitives(),
			unitsLeft: this.unitsLeft,
		};
	}
}
