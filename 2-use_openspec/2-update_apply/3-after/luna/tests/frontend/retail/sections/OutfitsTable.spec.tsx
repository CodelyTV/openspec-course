import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { OutfitsTable } from "@/contexts/frontend/retail/sections/OutfitsTable";

describe("OutfitsTable", () => {
	it("shows outfit counts and sold-out warnings", () => {
		render(
			<OutfitsTable
				outfits={[
					{
						id: "a",
						name: "Weekend Refactor",
						productCount: 3,
						outOfStockProductNames: ["Sold Out Layer"],
					},
					{
						id: "b",
						name: "Deploy Friday",
						productCount: 2,
						outOfStockProductNames: [],
					},
				]}
			/>,
		);
		expect(
			screen.getByText("Out of stock: Sold Out Layer"),
		).toBeInTheDocument();
		expect(screen.getByText("Deploy Friday")).toBeInTheDocument();
		expect(screen.getByText("2 products")).toBeInTheDocument();
	});
	it("offers creation when empty", () => {
		render(<OutfitsTable outfits={[]} />);
		expect(
			screen.getByRole("link", { name: /create the first outfit/i }),
		).toHaveAttribute("href", "/admin/outfits/new");
	});
});
