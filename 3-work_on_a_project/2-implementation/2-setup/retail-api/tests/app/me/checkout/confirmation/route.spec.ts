import { describe, expect, it, vi } from "vitest";

import { POST } from "@/app/me/checkout/confirmation/route";
import type { CheckoutConfirmer } from "@/contexts/backend/checkout/application/confirm/CheckoutConfirmer";
import { EmptyCheckoutError } from "@/contexts/backend/checkout/domain/errors/EmptyCheckoutError";

import { Mock } from "../../../../shared/Mock";

const checkoutConfirmer = Mock.create<CheckoutConfirmer>();

vi.mock("@/contexts/backend/shared/infrastructure/RetailContainer", () => ({
	retailContainer: {
		get checkoutConfirmer(): CheckoutConfirmer {
			return checkoutConfirmer;
		},
	},
}));

async function confirmCheckout(): Promise<Response> {
	return POST(
		new Request("http://localhost/me/checkout/confirmation", {
			method: "POST",
		}),
		undefined,
	);
}

describe("POST /me/checkout/confirmation should", () => {
	it("respond 201 with the id of the placed order", async () => {
		checkoutConfirmer.confirmShouldReturn("order-1");

		const response = await confirmCheckout();

		expect(response.status).toBe(201);
		expect(await response.json()).toEqual({ orderId: "order-1" });
	});

	it("respond 409 with an EmptyCheckoutError when the cart is empty", async () => {
		vi.mocked(checkoutConfirmer.confirm).mockRejectedValue(
			new EmptyCheckoutError(),
		);

		const response = await confirmCheckout();

		expect(response.status).toBe(409);
		expect(await response.json()).toEqual({
			error: {
				type: "EmptyCheckoutError",
				message: "Cannot confirm an empty checkout",
			},
		});
	});

	it("respond 500 without leaking the details of an unexpected error", async () => {
		vi.spyOn(console, "error").mockReturnValue(undefined);
		vi.mocked(checkoutConfirmer.confirm).mockRejectedValue(
			new Error("connection refused at 10.0.0.1"),
		);

		const response = await confirmCheckout();

		expect(response.status).toBe(500);
		expect(await response.json()).toEqual({
			error: {
				type: "InternalServerError",
				message: "Internal server error",
			},
		});
	});
});
