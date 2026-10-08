import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { OutfitsTable } from "@/contexts/frontend/retail/sections/OutfitsTable";

import { OutfitSummaryResponseMother } from "../responses/OutfitSummaryResponseMother";

function rowCells(row: HTMLElement): (string | null)[] {
	return within(row)
		.getAllByRole("cell")
		.map((cell) => cell.textContent);
}

describe("OutfitsTable should", () => {
	it("show each outfit with its number of products and a clear stock state", () => {
		render(
			<OutfitsTable
				outfits={[
					OutfitSummaryResponseMother.create({
						name: "Deploy Friday",
						productCount: 2,
					}),
				]}
			/>,
		);

		const [, outfitRow] = within(
			screen.getByRole("table", { name: "Outfits" }),
		).getAllByRole("row");

		expect(rowCells(outfitRow)).toEqual([
			"Deploy Friday",
			"2",
			"All pieces in stock",
		]);
	});

	it("warn about the sold-out pieces by name", () => {
		render(
			<OutfitsTable
				outfits={[
					OutfitSummaryResponseMother.create({
						name: "Weekend Refactor",
						productCount: 3,
						outOfStockProductNames: ["Pure Function Tee", "Hoodie"],
					}),
				]}
			/>,
		);

		const [, outfitRow] = within(
			screen.getByRole("table", { name: "Outfits" }),
		).getAllByRole("row");

		expect(rowCells(outfitRow)[2]).toBe(
			"Sold out: Pure Function Tee, Hoodie",
		);
	});

	it("link each outfit name to its edit page", () => {
		const outfit = OutfitSummaryResponseMother.create({
			name: "Deploy Friday",
		});
		render(<OutfitsTable outfits={[outfit]} />);

		expect(
			screen.getByRole("link", { name: "Deploy Friday" }),
		).toHaveAttribute("href", `/admin/outfits/${outfit.id}`);
	});

	it("show one row per outfit", () => {
		render(
			<OutfitsTable
				outfits={[
					OutfitSummaryResponseMother.create(),
					OutfitSummaryResponseMother.create(),
				]}
			/>,
		);

		const rows = within(
			screen.getByRole("table", { name: "Outfits" }),
		).getAllByRole("row");

		expect(rows).toHaveLength(3);
	});

	it("show an empty state with a way to create the first outfit", () => {
		render(<OutfitsTable outfits={[]} />);

		expect(screen.getByText("No outfits yet.")).toBeInTheDocument();
		expect(
			screen.getByRole("link", { name: "Create the first outfit" }),
		).toHaveAttribute("href", "/admin/outfits/new");
		expect(screen.queryByRole("table")).not.toBeInTheDocument();
	});
});
