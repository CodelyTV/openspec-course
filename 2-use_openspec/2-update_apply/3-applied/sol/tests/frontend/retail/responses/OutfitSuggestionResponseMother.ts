import type { OutfitSuggestionResponse } from "@/contexts/backend/products/application/find-suggestions/ProductSuggestionsFinder";

import { ProductResponseMother } from "./ProductResponseMother";

export class OutfitSuggestionResponseMother {
	static create(
		overrides: Partial<OutfitSuggestionResponse> = {},
	): OutfitSuggestionResponse {
		return {
			name: "Weekend Look",
			products: [
				ProductResponseMother.create({
					id: "current",
					name: "Current",
				}),
				ProductResponseMother.create({ id: "other", name: "Other" }),
			],
			...overrides,
		};
	}
}
