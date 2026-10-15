import { redirect } from "next/navigation";
import { describe, expect, it, vi } from "vitest";

import { initialActionState } from "@/app/actions/ActionState";
import { createOutfit } from "@/app/actions/outfits/createOutfit";
import { retailApi } from "@/contexts/frontend/retail/api/RetailApi";
import { RetailApiError } from "@/contexts/frontend/retail/api/RetailApiError";

vi.mock("@/contexts/frontend/retail/api/RetailApi", () => ({
	retailApi: { outfitCreator: { create: vi.fn() } },
}));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("next/navigation", () => ({ redirect: vi.fn() }));

const create = vi.mocked(retailApi.outfitCreator.create);

function outfitForm(name: string, productIds: string[]): FormData {
	const formData = new FormData();
	formData.set("name", name);
	for (const productId of productIds) {
		formData.append("productIds", productId);
	}

	return formData;
}

describe("createOutfit should", () => {
	it("create the outfit with the chosen products and go back to the list", async () => {
		create.mockResolvedValue();

		await createOutfit(
			initialActionState,
			outfitForm("Weekend", ["tee", "", "jeans"]),
		);

		expect(create).toHaveBeenCalledWith("Weekend", ["tee", "jeans"]);
		expect(redirect).toHaveBeenCalledWith("/admin/outfits");
	});

	it.each([
		["InvalidOutfitNameError", 422, "The outfit name is required."],
		[
			"InvalidOutfitSizeError",
			422,
			"An outfit needs between 2 and 4 products.",
		],
		[
			"RepeatedOutfitProductError",
			422,
			"A product can only appear once in an outfit.",
		],
		[
			"OutfitProductNotFoundError",
			422,
			"One of the products is no longer available.",
		],
		[
			"OutfitNameAlreadyExistsError",
			409,
			"An outfit with that name already exists.",
		],
	])(
		"explain why the outfit was rejected with %s",
		async (type, status, message) => {
			create.mockRejectedValue(
				new RetailApiError(status, type, "rejected"),
			);

			expect(
				await createOutfit(initialActionState, outfitForm("", ["tee"])),
			).toEqual({ error: message });
			expect(redirect).not.toHaveBeenCalled();
		},
	);
});
