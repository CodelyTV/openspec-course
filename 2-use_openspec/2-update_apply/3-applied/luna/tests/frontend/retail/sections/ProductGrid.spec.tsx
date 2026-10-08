import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ProductGrid } from "@/contexts/frontend/retail/sections/ProductGrid";

import { ProductResponseMother } from "../responses/ProductResponseMother";

describe("ProductGrid should", () => {
	it("show a card for each product", () => {
		render(
			<ProductGrid
				products={[
					ProductResponseMother.create({ id: "tee", name: "Tee" }),
					ProductResponseMother.create({
						id: "hoodie",
						name: "Hoodie",
					}),
				]}
			/>,
		);

		expect(
			screen
				.getAllByRole("heading")
				.map((heading) => heading.textContent),
		).toEqual(["Tee", "Hoodie"]);
	});

	it("tell there are no products when the list is empty", () => {
		render(<ProductGrid products={[]} />);

		expect(
			screen.getByText("There are no products here yet."),
		).toBeInTheDocument();
	});

	it("show a custom message when the list is empty", () => {
		render(
			<ProductGrid
				products={[]}
				emptyMessage="Nothing in this collection."
			/>,
		);

		expect(
			screen.getByText("Nothing in this collection."),
		).toBeInTheDocument();
	});
});
