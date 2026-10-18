import { faker } from "@faker-js/faker";

import {
	WishlistItem,
	type WishlistItemPrimitives,
} from "@/contexts/backend/products/domain/WishlistItem";

const referenceDate = new Date("2026-10-01T12:00:00.000Z");

export class WishlistItemMother {
	static create(
		overrides: Partial<WishlistItemPrimitives> = {},
	): WishlistItem {
		return WishlistItem.fromPrimitives(
			WishlistItemMother.createPrimitives(overrides),
		);
	}

	static createPrimitives(
		overrides: Partial<WishlistItemPrimitives> = {},
	): WishlistItemPrimitives {
		return {
			userId: `user-${faker.string.alphanumeric(8)}`,
			productId: faker.string.uuid(),
			savedAt: faker.date
				.recent({ refDate: referenceDate })
				.toISOString(),
			...overrides,
		};
	}
}
