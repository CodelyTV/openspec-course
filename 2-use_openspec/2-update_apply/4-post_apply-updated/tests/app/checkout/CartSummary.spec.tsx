import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { CartSummary } from "@/app/checkout/CartSummary";

import {
	CheckoutLineResponseMother,
	CheckoutResponseMother,
} from "../../frontend/retail/responses/CheckoutResponseMother";

vi.mock("@/app/actions/checkout/removeCartLine", () => ({
	removeCartLine: vi.fn(),
}));

describe("CartSummary should", () => {
	it("show each line with its variant, quantity and line total", () => {
		render(
			<CartSummary
				checkout={CheckoutResponseMother.create({
					lines: [
						CheckoutLineResponseMother.create({
							productName: "Tee",
							color: "Black",
							size: "M",
							quantity: 2,
							price: { amount: 30, currency: "USD" },
							lineTotal: { amount: 60, currency: "USD" },
						}),
					],
				})}
			/>,
		);

		const cart = within(
			screen.getByRole("article", { name: "Cart summary" }),
		);

		expect(cart.getByText("Tee")).toBeInTheDocument();
		expect(cart.getByText("Black / M · Qty 2")).toBeInTheDocument();
		expect(cart.getByText("US$60")).toBeInTheDocument();
		expect(
			cart.getByRole("button", { name: "Remove Tee Black / M" }),
		).toBeInTheDocument();
	});

	it("tell when the cart is empty", () => {
		render(
			<CartSummary
				checkout={CheckoutResponseMother.create({ lines: [] })}
			/>,
		);

		expect(screen.getByText("Your cart is empty")).toBeInTheDocument();
		expect(screen.queryByRole("button")).not.toBeInTheDocument();
	});
});
