import { describe, expect, it, vi } from "vitest";

import { POST } from "@/app/outfits/route";
import type { OutfitCreator } from "@/contexts/backend/products/application/create-outfit/OutfitCreator";
import { InvalidOutfitSizeError } from "@/contexts/backend/products/domain/errors/InvalidOutfitSizeError";
import { OutfitNameAlreadyExistsError } from "@/contexts/backend/products/domain/errors/OutfitNameAlreadyExistsError";

import { Mock } from "../../shared/Mock";

const outfitCreator = Mock.create<OutfitCreator>();

vi.mock("@/contexts/backend/shared/infrastructure/RetailContainer", () => ({
	retailContainer: {
		get outfitCreator(): OutfitCreator {
			return outfitCreator;
		},
	},
}));

async function postOutfit(body: string): Promise<Response> {
	return POST(
		new Request("http://localhost/outfits", { method: "POST", body }),
		undefined,
	);
}

describe("POST /outfits should", () => {
	it("create the outfit and respond 201", async () => {
		const response = await postOutfit(
			JSON.stringify({ name: "Weekend", productIds: ["tee", "jeans"] }),
		);

		expect(response.status).toBe(201);
		outfitCreator.expectCreateToHaveBeenCalledWith("Weekend", [
			"tee",
			"jeans",
		]);
	});

	it("respond 400 with an InvalidArgumentError when the body is not valid JSON", async () => {
		const response = await postOutfit("not json");

		expect(response.status).toBe(400);
		expect((await response.json()).error.type).toBe("InvalidArgumentError");
		outfitCreator.expectCreateNotToHaveBeenCalled();
	});

	it("respond 400 with an InvalidArgumentError when productIds is not a list of strings", async () => {
		const response = await postOutfit(
			JSON.stringify({ name: "Weekend", productIds: "tee" }),
		);

		expect(response.status).toBe(400);
		expect((await response.json()).error.type).toBe("InvalidArgumentError");
	});

	it("respond 422 when the outfit breaks a business rule", async () => {
		vi.mocked(outfitCreator.create).mockRejectedValue(
			new InvalidOutfitSizeError(1, 2, 4),
		);

		const response = await postOutfit(
			JSON.stringify({ name: "Weekend", productIds: ["tee"] }),
		);

		expect(response.status).toBe(422);
		expect(await response.json()).toEqual({
			error: {
				type: "InvalidOutfitSizeError",
				message: "An outfit needs between 2 and 4 products, got 1",
			},
		});
	});

	it("respond 409 when an outfit with the same name already exists", async () => {
		vi.mocked(outfitCreator.create).mockRejectedValue(
			new OutfitNameAlreadyExistsError("Weekend"),
		);

		const response = await postOutfit(
			JSON.stringify({ name: "Weekend", productIds: ["tee", "jeans"] }),
		);

		expect(response.status).toBe(409);
		expect((await response.json()).error.type).toBe(
			"OutfitNameAlreadyExistsError",
		);
	});
});
