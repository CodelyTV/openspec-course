import { redirect } from "next/navigation";
import { describe, expect, it, vi } from "vitest";

import { initialActionState } from "@/app/actions/ActionState";
import { addSelectedVariantToCart } from "@/app/actions/checkout/addSelectedVariantToCart";
import { retailApi } from "@/contexts/frontend/retail/api/RetailApi";
import { RetailApiError } from "@/contexts/frontend/retail/api/RetailApiError";

vi.mock("@/contexts/frontend/retail/api/RetailApi", () => ({
	retailApi: { cartVariantAdder: { add: vi.fn() } },
}));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("next/navigation", () => ({ redirect: vi.fn() }));

const addVariant = vi.mocked(retailApi.cartVariantAdder.add);

function formWithVariant(variantId: string): FormData {
	const formData = new FormData();
	formData.set("variantId", variantId);

	return formData;
}

describe("addSelectedVariantToCart should", () => {
	it("add the variant and go to checkout", async () => {
		addVariant.mockResolvedValue();

		await addSelectedVariantToCart(
			initialActionState,
			formWithVariant("tee-m"),
		);

		expect(addVariant).toHaveBeenCalledWith("tee-m");
		expect(redirect).toHaveBeenCalledWith("/checkout");
	});

	it("explain that the selected variant is no longer available", async () => {
		addVariant.mockRejectedValue(
			new RetailApiError(422, "CatalogItemNotFoundError", "not found"),
		);

		expect(
			await addSelectedVariantToCart(
				initialActionState,
				formWithVariant("tee-m"),
			),
		).toEqual({ error: "The selected variant is no longer available." });
		expect(redirect).not.toHaveBeenCalled();
	});

	it("reject a form without variant before calling the API", async () => {
		expect(
			await addSelectedVariantToCart(initialActionState, new FormData()),
		).toEqual({
			error: "Something in the request was not valid. Reload the page and try again.",
		});
		expect(addVariant).not.toHaveBeenCalled();
	});
});
