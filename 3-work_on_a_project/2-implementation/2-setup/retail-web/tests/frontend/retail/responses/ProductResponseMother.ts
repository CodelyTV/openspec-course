import { faker } from "@faker-js/faker";

import type {
	ProductAccent,
	ProductColor,
	ProductResponse,
	ProductVariantResponse,
	SizeGuideRow,
} from "@/contexts/frontend/retail/api/responses";

import { MoneyMother } from "./MoneyMother";
import { ProductVariantResponseMother } from "./ProductVariantResponseMother";
import { sizesInDisplayOrder } from "./SizeMother";

const accents: ProductAccent[] = ["green", "violet", "yellow", "pink"];

type DerivedFromVariants =
	"colors" | "sizeGuide" | "totalOnlineStock" | "firstAvailableVariantId";

export class ProductResponseMother {
	static create(
		overrides: Partial<Omit<ProductResponse, DerivedFromVariants>> = {},
	): ProductResponse {
		const variants = overrides.variants ?? [
			ProductVariantResponseMother.create(),
		];

		return {
			id: faker.helpers
				.slugify(faker.commerce.productName())
				.toLowerCase(),
			name: faker.commerce.productName(),
			collection: faker.commerce.department(),
			category: faker.commerce.department(),
			description: faker.commerce.productDescription(),
			price: MoneyMother.createPrimitives(),
			badges: [],
			accent: faker.helpers.arrayElement(accents),
			...overrides,
			variants: bySize(variants),
			colors: colorsOf(variants),
			sizeGuide: sizeGuideOf(variants),
			totalOnlineStock: variants.reduce(
				(total, variant) => total + variant.onlineStock,
				0,
			),
			firstAvailableVariantId:
				variants.find((variant) => variant.hasStock)?.id ?? null,
		};
	}
}

function bySize(variants: ProductVariantResponse[]): ProductVariantResponse[] {
	return [...variants].sort(
		(a, b) =>
			sizesInDisplayOrder.indexOf(a.size) -
				sizesInDisplayOrder.indexOf(b.size) ||
			a.color.localeCompare(b.color),
	);
}

function colorsOf(variants: ProductVariantResponse[]): ProductColor[] {
	const colors: ProductColor[] = [];

	for (const variant of variants) {
		if (!colors.some((color) => color.name === variant.color)) {
			colors.push({ name: variant.color, hex: variant.colorHex });
		}
	}

	return colors;
}

function sizeGuideOf(variants: ProductVariantResponse[]): SizeGuideRow[] {
	return sizesInDisplayOrder.flatMap((size) => {
		const variantOfThatSize = variants.find(
			(variant) => variant.size === size,
		);

		return variantOfThatSize
			? [{ size, ...variantOfThatSize.measurements }]
			: [];
	});
}
