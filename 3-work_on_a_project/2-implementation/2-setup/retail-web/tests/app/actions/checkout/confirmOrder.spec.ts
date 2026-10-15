import { redirect } from "next/navigation";
import { describe, expect, it, vi } from "vitest";

import { initialActionState } from "@/app/actions/ActionState";
import { confirmOrder } from "@/app/actions/checkout/confirmOrder";
import { retailApi } from "@/contexts/frontend/retail/api/RetailApi";
import { RetailApiError } from "@/contexts/frontend/retail/api/RetailApiError";

vi.mock("@/contexts/frontend/retail/api/RetailApi", () => ({
	retailApi: { checkoutConfirmer: { confirm: vi.fn() } },
}));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("next/navigation", () => ({ redirect: vi.fn() }));

const confirm = vi.mocked(retailApi.checkoutConfirmer.confirm);

describe("confirmOrder should", () => {
	it("show the placed order", async () => {
		confirm.mockResolvedValue("order 1");

		await confirmOrder(initialActionState);

		expect(redirect).toHaveBeenCalledWith("/checkout?order=order%201");
	});

	it("explain that an item of the cart ran out of stock", async () => {
		confirm.mockRejectedValue(
			new RetailApiError(409, "VariantOutOfStockError", "no stock"),
		);

		expect(await confirmOrder(initialActionState)).toEqual({
			error: "One of the items in your cart doesn't have enough stock left. Review it and try again.",
		});
	});

	it("explain that the cart changed in the meantime", async () => {
		confirm.mockRejectedValue(
			new RetailApiError(
				409,
				"CheckoutConcurrentModificationError",
				"conflict",
			),
		);

		expect(await confirmOrder(initialActionState)).toEqual({
			error: "Your cart changed in the meantime. Review it and try again.",
		});
	});
});
