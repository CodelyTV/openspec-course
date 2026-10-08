import { faker } from "@faker-js/faker";

import {
	Outfit,
	type OutfitPrimitives,
} from "@/contexts/backend/products/domain/Outfit";

export class OutfitMother {
	static create(overrides: Partial<OutfitPrimitives> = {}): Outfit {
		return Outfit.fromPrimitives(this.createPrimitives(overrides));
	}

	static createPrimitives(
		overrides: Partial<OutfitPrimitives> = {},
	): OutfitPrimitives {
		return {
			id: faker.string.uuid(),
			name: faker.commerce.productName(),
			productIds: [faker.string.uuid(), faker.string.uuid()],
			...overrides,
		};
	}
}
