import { describe, expect, it } from "vitest";

import { OutfitDeleter } from "@/contexts/backend/products/application/delete-outfit/OutfitDeleter";
import { OutfitNotFoundError } from "@/contexts/backend/products/domain/errors/OutfitNotFoundError";
import type { OutfitRepository } from "@/contexts/backend/products/domain/OutfitRepository";

import { Mock } from "../../../../shared/Mock";
import { OutfitMother } from "../../domain/OutfitMother";

describe("OutfitDeleter should", () => {
	const repository = Mock.create<OutfitRepository>();
	const deleter = new OutfitDeleter(repository);

	it("delete an existing outfit", async () => {
		const outfit = OutfitMother.create();
		repository.searchShouldReturn(outfit);

		await deleter.delete(outfit.id.value);

		repository.expectDeleteToHaveBeenCalledWith(outfit.id);
	});

	it("fail when the outfit no longer exists", async () => {
		repository.searchShouldReturn(null);

		await expect(deleter.delete("ghost")).rejects.toBeInstanceOf(
			OutfitNotFoundError,
		);
		repository.expectDeleteNotToHaveBeenCalled();
	});
});
