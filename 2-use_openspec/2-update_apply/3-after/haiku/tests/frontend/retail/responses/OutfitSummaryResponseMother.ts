import { faker } from "@faker-js/faker";

import type { OutfitSummaryResponse } from "@/contexts/backend/products/application/OutfitResponse";

export class OutfitSummaryResponseMother {
	static create(
		overrides: Partial<OutfitSummaryResponse> = {},
	): OutfitSummaryResponse {
		return {
			id: faker.string.uuid(),
			name: faker.commerce.productName(),
			productCount: faker.number.int({ min: 2, max: 4 }),
			outOfStockProductNames: [],
			...overrides,
		};
	}
}
