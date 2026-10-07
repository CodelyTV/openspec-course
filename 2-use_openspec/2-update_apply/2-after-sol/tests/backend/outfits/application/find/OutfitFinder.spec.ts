import { describe, expect, it } from "vitest";

import { OutfitFinder } from "@/contexts/backend/outfits/application/find/OutfitFinder";
import type { OutfitRepository } from "@/contexts/backend/outfits/domain/OutfitRepository";

import { Mock } from "../../../../shared/Mock";
import { OutfitMother } from "../../domain/OutfitMother";

describe("OutfitFinder should", () => {
	const repository = Mock.create<OutfitRepository>();
	const useCase = new OutfitFinder(repository);
	const outfit = OutfitMother.create();
	it("return the found outfit", async () => {
		repository.searchShouldReturn(outfit);
		expect(await useCase.find(outfit.id.value)).toEqual(
			outfit.toPrimitives(),
		);
		repository.expectSearchToHaveBeenCalledWith(outfit.id);
	});
	it("return null for an unknown id", async () => {
		repository.searchShouldReturn(null);
		expect(await useCase.find("missing")).toBeNull();
	});
});
