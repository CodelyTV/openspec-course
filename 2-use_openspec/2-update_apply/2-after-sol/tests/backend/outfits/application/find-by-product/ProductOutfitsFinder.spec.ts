import { describe, expect, it } from "vitest";

import { ProductOutfitsFinder } from "@/contexts/backend/outfits/application/find-by-product/ProductOutfitsFinder";
import type { OutfitRepository } from "@/contexts/backend/outfits/domain/OutfitRepository";
import { ProductId } from "@/contexts/shared/domain/ProductId";

import { Mock } from "../../../../shared/Mock";
import { OutfitMother } from "../../domain/OutfitMother";

describe("ProductOutfitsFinder should", () => {
	const repository = Mock.create<OutfitRepository>();
	const useCase = new ProductOutfitsFinder(repository);
	it("return outfits ordered by name", async () => {
		const a = OutfitMother.create({ name: "A" });
		const b = OutfitMother.create({ name: "B" });
		repository.searchContainingShouldReturn([b, a]);
		expect(await useCase.find("shared")).toEqual([
			a.toPrimitives(),
			b.toPrimitives(),
		]);
		repository.expectSearchContainingToHaveBeenCalledWith(
			new ProductId("shared"),
		);
	});
	it("return no outfits when none match", async () => {
		repository.searchContainingShouldReturn([]);
		expect(await useCase.find("shared")).toEqual([]);
	});
});
