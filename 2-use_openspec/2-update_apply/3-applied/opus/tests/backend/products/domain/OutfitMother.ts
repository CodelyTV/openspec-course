import { faker } from "@faker-js/faker";

import {
	maxProductsPerOutfit,
	minProductsPerOutfit,
	Outfit,
	type OutfitPrimitives,
} from "@/contexts/backend/products/domain/Outfit";
import { OutfitId } from "@/contexts/backend/products/domain/OutfitId";
import { ProductId } from "@/contexts/shared/domain/ProductId";

export class OutfitMother {
	static create(overrides: Partial<OutfitPrimitives> = {}): Outfit {
		const primitives = OutfitMother.createPrimitives(overrides);

		return Outfit.create(
			new OutfitId(primitives.id),
			primitives.name,
			primitives.productIds.map((productId) => new ProductId(productId)),
		);
	}

	static createPrimitives(
		overrides: Partial<OutfitPrimitives> = {},
	): OutfitPrimitives {
		return {
			id: faker.string.uuid(),
			name: `${faker.word.adjective()} ${faker.word.noun()} ${faker.string.alphanumeric(4)}`,
			productIds: faker.helpers.uniqueArray(
				() => faker.string.uuid(),
				faker.number.int({
					min: minProductsPerOutfit,
					max: maxProductsPerOutfit,
				}),
			),
			...overrides,
		};
	}

	static withOnlyOneProductLeft(
		overrides: Partial<Omit<OutfitPrimitives, "productIds">> & {
			productId?: string;
		} = {},
	): Outfit {
		const { productId = faker.string.uuid(), ...rest } = overrides;

		return Outfit.fromPrimitives(
			OutfitMother.createPrimitives({ ...rest, productIds: [productId] }),
		);
	}
}
