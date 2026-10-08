import { describe, it } from "vitest";

import { OutfitDeleter } from "@/contexts/backend/products/application/delete-outfit/OutfitDeleter";
import { OutfitId } from "@/contexts/backend/products/domain/OutfitId";
import type { OutfitRepository } from "@/contexts/backend/products/domain/OutfitRepository";

import { Mock } from "../../../../shared/Mock";

describe("OutfitDeleter", () => {
	it("deletes by outfit id", async () => {
		const repository = Mock.create<OutfitRepository>();
		await new OutfitDeleter(repository).delete("look");
		repository.expectDeleteToHaveBeenCalledWith(new OutfitId("look"));
	});
});
