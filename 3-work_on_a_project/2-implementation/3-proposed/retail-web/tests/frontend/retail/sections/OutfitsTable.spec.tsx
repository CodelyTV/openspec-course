import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { OutfitsTable } from "@/contexts/frontend/retail/sections/OutfitsTable";

import { OutfitSummaryResponseMother } from "../responses/OutfitSummaryResponseMother";

function cellsOfRow(index: number): Array<string | null> {
	const rows = within(
		screen.getByRole("table", { name: "Outfits" }),
	).getAllByRole("row");

	return within(rows[index + 1])
		.getAllByRole("cell")
		.map((cell) => cell.textContent);
}

describe("OutfitsTable should", () => {
	it("show each outfit with its number of products and no warning when every piece has stock", () => {
		render(
			<OutfitsTable
				outfits={[
					OutfitSummaryResponseMother.create({
						name: "Deploy Friday",
						productCount: 2,
					}),
					OutfitSummaryResponseMother.create({
						name: "Left Alone",
						productCount: 1,
					}),
				]}
			/>,
		);

		expect(cellsOfRow(0)).toEqual([
			"Deploy Friday",
			"2 products",
			"Every piece in stock",
		]);
		expect(cellsOfRow(1)).toEqual([
			"Left Alone",
			"1 product",
			"Every piece in stock",
		]);
	});

	it("warn about the sold-out pieces of an outfit naming them in order", () => {
		render(
			<OutfitsTable
				outfits={[
					OutfitSummaryResponseMother.create({
						name: "Weekend Refactor",
						productCount: 4,
						outOfStockProductNames: ["Pure Function Tee", "Chinos"],
					}),
				]}
			/>,
		);

		expect(cellsOfRow(0)).toEqual([
			"Weekend Refactor",
			"4 products",
			"Sold out: Pure Function Tee, Chinos",
		]);
	});

	it("link each outfit to its edit page", () => {
		render(
			<OutfitsTable
				outfits={[
					OutfitSummaryResponseMother.create({
						id: "outfit-1",
						name: "Deploy Friday",
					}),
				]}
			/>,
		);

		expect(
			screen.getByRole("link", { name: "Deploy Friday" }),
		).toHaveAttribute("href", "/admin/outfits/outfit-1");
	});

	it("offer to create the first outfit when there are none", () => {
		render(<OutfitsTable outfits={[]} />);

		expect(
			screen.getByText("There are no outfits yet."),
		).toBeInTheDocument();
		expect(
			screen.getByRole("link", { name: "Create the first outfit" }),
		).toHaveAttribute("href", "/admin/outfits/new");
		expect(screen.queryByRole("table")).not.toBeInTheDocument();
	});
});
