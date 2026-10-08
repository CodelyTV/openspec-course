import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { OrderConfirmation } from "@/app/checkout/OrderConfirmation";

describe("OrderConfirmation should", () => {
	it("announce the placed order linking to its detail", () => {
		render(<OrderConfirmation orderId="order-1" />);

		const confirmation = screen.getByRole("status");

		expect(confirmation).toHaveTextContent("Order confirmed");
		expect(
			within(confirmation).getByRole("link", { name: "order-1" }),
		).toHaveAttribute("href", "/account/orders/order-1");
	});
});
