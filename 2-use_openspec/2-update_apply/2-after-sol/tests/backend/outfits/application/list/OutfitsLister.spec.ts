import { describe, expect, it } from "vitest";

import { OutfitsLister } from "@/contexts/backend/outfits/application/list/OutfitsLister";
import type { OutfitRepository } from "@/contexts/backend/outfits/domain/OutfitRepository";

import { Mock } from "../../../../shared/Mock";
import { OutfitMother } from "../../domain/OutfitMother";

describe("OutfitsLister should", () => {
	const repository = Mock.create<OutfitRepository>();
	const useCase = new OutfitsLister(repository);
	it("return outfits ordered by name", async () => {
		const a = OutfitMother.create({ name: "A" });
		const b = OutfitMother.create({ name: "B" });
		repository.searchAllShouldReturn([b, a]);
		expect(await useCase.list()).toEqual([
			a.toPrimitives(),
			b.toPrimitives(),
		]);
		repository.expectSearchAllToHaveBeenCalledWith();
	});
	it("return no outfits when none match", async () => {
		repository.searchAllShouldReturn([]);
		expect(await useCase.list()).toEqual([]);
	});
});
