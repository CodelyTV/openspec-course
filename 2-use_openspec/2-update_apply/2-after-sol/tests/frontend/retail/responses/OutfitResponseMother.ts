import type { OutfitResponse } from "@/contexts/backend/outfits/application/OutfitResponse";

import { OutfitMother } from "../../../backend/outfits/domain/OutfitMother";

export class OutfitResponseMother {
	static create(overrides: Partial<OutfitResponse> = {}): OutfitResponse {
		return OutfitMother.createPrimitives(overrides);
	}
}
