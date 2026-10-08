import { describe, expect, it } from "vitest";

import { OutfitDeleter } from "@/contexts/backend/products/application/delete-outfit/OutfitDeleter";
import { OutfitNotFoundError } from "@/contexts/backend/products/domain/errors/OutfitNotFoundError";
import { OutfitId } from "@/contexts/backend/products/domain/OutfitId";
import type { OutfitRepository } from "@/contexts/backend/products/domain/OutfitRepository";

import { Mock } from "../../../../shared/Mock";
import { OutfitMother } from "../../domain/OutfitMother";

describe("OutfitDeleter should", () => {
	const repository = Mock.create<OutfitRepository>();
	const deleter = new OutfitDeleter(repository);

	it("delete an existing outfit", async () => {
		repository.searchShouldReturn(OutfitMother.create({ id: "outfit-1" }));

		await deleter.delete("outfit-1");

		repository.expectDeleteToHaveBeenCalledWith(new OutfitId("outfit-1"));
	});

	it("fail when the outfit does not exist", async () => {
		repository.searchShouldReturn(null);

		await expect(deleter.delete("ghost")).rejects.toBeInstanceOf(
			OutfitNotFoundError,
		);
		repository.expectDeleteNotToHaveBeenCalled();
	});
});
