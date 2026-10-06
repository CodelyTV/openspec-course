import { parseLiteral } from "@/contexts/shared/domain/parseLiteral";
import { VariantId } from "@/contexts/shared/domain/VariantId";

export const sizeOrder = ["XS", "S", "M", "L", "XL"] as const;

export type Size = (typeof sizeOrder)[number];

export function parseSize(value: string): Size {
	return parseLiteral("size", sizeOrder, value);
}

export const lowStockThreshold = 2;

export type ProductVariantPrimitives = {
	id: string;
	color: string;
	colorHex: string;
	size: Size;
	onlineStock: number;
	measurements: { chest: number; length: number };
};

export class ProductVariant {
	constructor(
		readonly id: VariantId,
		readonly color: string,
		readonly colorHex: string,
		readonly size: Size,
		readonly onlineStock: number,
		readonly measurements: { chest: number; length: number },
	) {}

	static fromPrimitives(
		primitives: ProductVariantPrimitives,
	): ProductVariant {
		return new ProductVariant(
			new VariantId(primitives.id),
			primitives.color,
			primitives.colorHex,
			primitives.size,
			primitives.onlineStock,
			primitives.measurements,
		);
	}

	hasStock(): boolean {
		return this.hasStockFor(1);
	}

	hasStockFor(quantity: number): boolean {
		return this.onlineStock >= quantity;
	}

	isLowStock(): boolean {
		return this.onlineStock <= lowStockThreshold;
	}

	toPrimitives(): ProductVariantPrimitives {
		return {
			id: this.id.value,
			color: this.color,
			colorHex: this.colorHex,
			size: this.size,
			onlineStock: this.onlineStock,
			measurements: this.measurements,
		};
	}
}
