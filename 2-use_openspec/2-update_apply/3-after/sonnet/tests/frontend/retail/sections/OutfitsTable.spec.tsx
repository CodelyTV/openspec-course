import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { OutfitsTable } from "@/contexts/frontend/retail/sections/OutfitsTable";

import { OutfitSummaryResponseMother } from "../responses/OutfitSummaryResponseMother";

function rowOf(name: string): HTMLElement {
	const row = within(screen.getByRole("table", { name: "Outfits" }))
		.getAllByRole("row")
		.find((candidate) => within(candidate).queryByText(name));

	if (!row) {
		throw new Error(`No row for ${name}`);
	}

	return row;
}

describe("OutfitsTable should", () => {
	it("show each outfit with its number of products linking to its edit page", () => {
		render(
			<OutfitsTable
				outfits={[
					OutfitSummaryResponseMother.create({
						id: "outfit-1",
						name: "Weekend Refactor",
						productCount: 4,
					}),
				]}
			/>,
		);

		expect(
			screen.getByRole("link", { name: "Weekend Refactor" }),
		).toHaveAttribute("href", "/admin/outfits/outfit-1");
		expect(rowOf("Weekend Refactor")).toHaveTextContent("4");
	});

	it("warn about the sold-out pieces naming them", () => {
		render(
			<OutfitsTable
				outfits={[
					OutfitSummaryResponseMother.create({
						name: "Weekend Refactor",
						outOfStockProductNames: [
							"Pure Function Tee",
							"Null Pointer Tee",
						],
					}),
				]}
			/>,
		);

		expect(rowOf("Weekend Refactor")).toHaveTextContent(
			"Sold out: Pure Function Tee, Null Pointer Tee",
		);
	});

	it("show no warning for an outfit whose pieces all have stock", () => {
		render(
			<OutfitsTable
				outfits={[
					OutfitSummaryResponseMother.create({
						name: "Deploy Friday",
						outOfStockProductNames: [],
					}),
				]}
			/>,
		);

		expect(rowOf("Deploy Friday")).not.toHaveTextContent("Sold out");
	});

	it("keep the order of the outfits it is given", () => {
		render(
			<OutfitsTable
				outfits={[
					OutfitSummaryResponseMother.create({
						name: "Deploy Friday",
					}),
					OutfitSummaryResponseMother.create({
						name: "Weekend Refactor",
						outOfStockProductNames: ["Tee"],
					}),
				]}
			/>,
		);

		const links = screen
			.getAllByRole("link")
			.map((link) => link.textContent);

		expect(links).toEqual(["Deploy Friday", "Weekend Refactor"]);
	});

	it("invite to create the first outfit when there are none", () => {
		render(<OutfitsTable outfits={[]} />);

		expect(
			screen.getByRole("link", { name: "Create the first outfit" }),
		).toHaveAttribute("href", "/admin/outfits/new");
		expect(screen.queryByRole("table")).not.toBeInTheDocument();
	});
});
