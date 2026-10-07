import { Money, type MoneyPrimitives } from "@/contexts/shared/domain/Money";
import { parseLiteral } from "@/contexts/shared/domain/parseLiteral";
import { ProductId } from "@/contexts/shared/domain/ProductId";
import type { VariantId } from "@/contexts/shared/domain/VariantId";

import {
	ProductVariant,
	type ProductVariantPrimitives,
	type Size,
	sizeOrder,
} from "./ProductVariant";

export const productAccents = ["green", "violet", "yellow", "pink"] as const;

export type ProductAccent = (typeof productAccents)[number];

export function parseProductAccent(value: string): ProductAccent {
	return parseLiteral("product accent", productAccents, value);
}

export type ProductColor = { name: string; hex: string };

export type SizeGuideRow = { size: Size; chest: number; length: number };

export type ProductPrimitives = {
	id: string;
	name: string;
	collection: string;
	category: string;
	description: string;
	price: MoneyPrimitives;
	badges: string[];
	accent: ProductAccent;
	variants: ProductVariantPrimitives[];
};

export class Product {
	constructor(
		readonly id: ProductId,
		readonly name: string,
		readonly collection: string,
		readonly category: string,
		readonly description: string,
		readonly price: Money,
		readonly badges: string[],
		readonly accent: ProductAccent,
		readonly variants: ProductVariant[],
	) {}

	static fromPrimitives(primitives: ProductPrimitives): Product {
		return new Product(
			new ProductId(primitives.id),
			primitives.name,
			primitives.collection,
			primitives.category,
			primitives.description,
			Money.fromPrimitives(primitives.price),
			primitives.badges,
			primitives.accent,
			primitives.variants.map(ProductVariant.fromPrimitives),
		);
	}

	firstAvailableVariant(): ProductVariant | undefined {
		return this.variants.find((variant) => variant.hasStock());
	}

	variant(variantId: VariantId): ProductVariant | undefined {
		return this.variants.find((variant) => variant.id.equals(variantId));
	}

	variantsBySize(): ProductVariant[] {
		return [...this.variants].sort(
			(a, b) =>
				sizeOrder.indexOf(a.size) - sizeOrder.indexOf(b.size) ||
				a.color.localeCompare(b.color),
		);
	}

	sizeGuide(): SizeGuideRow[] {
		return sizeOrder.flatMap((size) => {
			const variantOfThatSize = this.variants.find(
				(variant) => variant.size === size,
			);

			return variantOfThatSize
				? [{ size, ...variantOfThatSize.measurements }]
				: [];
		});
	}

	colors(): ProductColor[] {
		const colors: ProductColor[] = [];

		for (const variant of this.variants) {
			if (!colors.some((color) => color.name === variant.color)) {
				colors.push({ name: variant.color, hex: variant.colorHex });
			}
		}

		return colors;
	}

	totalOnlineStock(): number {
		return this.variants.reduce(
			(total, variant) => total + variant.onlineStock,
			0,
		);
	}

	toPrimitives(): ProductPrimitives {
		return {
			id: this.id.value,
			name: this.name,
			collection: this.collection,
			category: this.category,
			description: this.description,
			price: this.price.toPrimitives(),
			badges: this.badges,
			accent: this.accent,
			variants: this.variants.map((variant) => variant.toPrimitives()),
		};
	}
}
