import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CustomerWishlist } from "@/contexts/frontend/retail/sections/CustomerWishlist";

import { ProductResponseMother } from "../responses/ProductResponseMother";

describe("CustomerWishlist should", () => {
	it("list the products in the given order, each linking to its product page", () => {
		render(
			<CustomerWishlist
				products={[
					ProductResponseMother.create({
						id: "hexagonal-overshirt",
						name: "Hexagonal Overshirt",
					}),
					ProductResponseMother.create({
						id: "domain-event-tee",
						name: "Domain Event Tee",
					}),
				]}
			/>,
		);

		expect(
			screen
				.getAllByRole("heading")
				.map((heading) => heading.textContent),
		).toEqual(["Hexagonal Overshirt", "Domain Event Tee"]);
		expect(
			screen
				.getAllByRole("link")
				.map((link) => link.getAttribute("href")),
		).toEqual(
			expect.arrayContaining([
				"/products/hexagonal-overshirt",
				"/products/domain-event-tee",
			]),
		);
	});

	it("show the empty state with a link to the catalog", () => {
		render(<CustomerWishlist products={[]} />);

		expect(screen.getByText("Your wishlist is empty.")).toBeInTheDocument();
		expect(
			screen.getByRole("link", { name: "Browse the catalog" }),
		).toHaveAttribute("href", "/");
	});
});
