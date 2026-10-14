import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CartLinkView } from "@/contexts/frontend/retail/sections/CartLinkView";

describe("CartLinkView should", () => {
	it("link to the checkout announcing how many items the cart holds", () => {
		render(<CartLinkView itemCount={3} />);

		const link = screen.getByRole("link", { name: "Cart, 3 items" });

		expect(link).toHaveAttribute("href", "/checkout");
		expect(link).toHaveTextContent("3");
	});

	it("use the singular for a single item", () => {
		render(<CartLinkView itemCount={1} />);

		expect(
			screen.getByRole("link", { name: "Cart, 1 item" }),
		).toBeInTheDocument();
	});

	it("show no counter when the cart is empty", () => {
		render(<CartLinkView itemCount={0} />);

		expect(
			screen.getByRole("link", { name: "Cart, 0 items" }),
		).not.toHaveTextContent("0");
	});
});
