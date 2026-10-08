import type { OutfitSuggestionResponse } from "@/contexts/backend/products/application/find-suggestions/ProductSuggestionsFinder";

import { ProductResponseMother } from "./ProductResponseMother";

export class OutfitSuggestionResponseMother {
	static create(
		overrides: Partial<OutfitSuggestionResponse> = {},
	): OutfitSuggestionResponse {
		return {
			name: "Weekend Refactor",
			products: [
				ProductResponseMother.create({
					id: "a",
					name: "Hexagonal Overshirt",
				}),
				ProductResponseMother.create({
					id: "b",
					name: "Pure Function Tee",
				}),
			],
			...overrides,
		};
	}
}
