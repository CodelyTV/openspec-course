import { describe, it } from "vitest";

import { OutfitDeleter } from "@/contexts/backend/products/application/delete-outfit/OutfitDeleter";
import { OutfitId } from "@/contexts/backend/products/domain/OutfitId";
import type { OutfitRepository } from "@/contexts/backend/products/domain/OutfitRepository";

import { Mock } from "../../../../shared/Mock";

describe("OutfitDeleter should", () => {
	const outfitRepository = Mock.create<OutfitRepository>();
	const deleter = new OutfitDeleter(outfitRepository);

	it("delete the outfit with the given id", async () => {
		await deleter.delete("deploy-friday");

		outfitRepository.expectDeleteToHaveBeenCalledWith(
			new OutfitId("deploy-friday"),
		);
	});
});
