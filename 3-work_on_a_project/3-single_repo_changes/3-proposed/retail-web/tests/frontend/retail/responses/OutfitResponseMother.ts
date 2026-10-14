import { faker } from "@faker-js/faker";

import type { OutfitResponse } from "@/contexts/frontend/retail/api/responses";

export class OutfitResponseMother {
	static create(overrides: Partial<OutfitResponse> = {}): OutfitResponse {
		return {
			id: faker.string.uuid(),
			name: `${faker.word.adjective()} ${faker.word.noun()}`,
			productIds: faker.helpers.uniqueArray(
				() => faker.string.uuid(),
				faker.number.int({ min: 2, max: 4 }),
			),
			...overrides,
		};
	}
}
