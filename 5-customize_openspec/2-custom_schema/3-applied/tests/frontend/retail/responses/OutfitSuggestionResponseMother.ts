import { faker } from "@faker-js/faker";

import type { OutfitSuggestionResponse } from "@/contexts/backend/products/application/find-suggestions/ProductSuggestionsFinder";

import { ProductResponseMother } from "./ProductResponseMother";

export class OutfitSuggestionResponseMother {
	static create(
		overrides: Partial<OutfitSuggestionResponse> = {},
	): OutfitSuggestionResponse {
		return {
			name: `${faker.word.adjective()} ${faker.word.noun()}`,
			products: [
				ProductResponseMother.create(),
				ProductResponseMother.create(),
			],
			...overrides,
		};
	}
}
