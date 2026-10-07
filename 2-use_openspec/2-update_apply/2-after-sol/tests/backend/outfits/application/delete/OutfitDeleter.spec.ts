import { describe, it } from "vitest";

import { OutfitDeleter } from "@/contexts/backend/outfits/application/delete/OutfitDeleter";
import type { OutfitRepository } from "@/contexts/backend/outfits/domain/OutfitRepository";

import { Mock } from "../../../../shared/Mock";
import { OutfitMother } from "../../domain/OutfitMother";

describe("OutfitDeleter should", () => {
	const repository = Mock.create<OutfitRepository>();
	const useCase = new OutfitDeleter(repository);
	const outfit = OutfitMother.create();
	it("delete the requested outfit", async () => {
		await useCase.delete(outfit.id.value);
		repository.expectDeleteToHaveBeenCalledWith(outfit.id);
	});
});
