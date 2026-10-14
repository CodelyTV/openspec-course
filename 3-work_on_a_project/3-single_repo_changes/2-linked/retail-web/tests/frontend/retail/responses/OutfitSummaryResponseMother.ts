import { faker } from "@faker-js/faker";

import type { OutfitSummaryResponse } from "@/contexts/frontend/retail/api/responses";

export class OutfitSummaryResponseMother {
	static create(
		overrides: Partial<OutfitSummaryResponse> = {},
	): OutfitSummaryResponse {
		return {
			id: faker.string.uuid(),
			name: `${faker.word.adjective()} ${faker.word.noun()}`,
			productCount: faker.number.int({ min: 2, max: 4 }),
			outOfStockProductNames: [],
			...overrides,
		};
	}
}
