import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { InventoryTable } from "@/contexts/frontend/retail/sections/InventoryTable";

import { InventoryResponseMother } from "../responses/InventoryResponseMother";

describe("InventoryTable should", () => {
	it("show each variant with its product, collection and stock", () => {
		render(
			<InventoryTable
				inventory={[
					InventoryResponseMother.create({
						productName: "Tee",
						collection: "Core",
						color: "Black",
						size: "M",
						stock: 7,
					}),
				]}
			/>,
		);

		const [, variantRow] = within(
			screen.getByRole("table", { name: "Inventory" }),
		).getAllByRole("row");
		const cells = within(variantRow)
			.getAllByRole("cell")
			.map((cell) => cell.textContent);

		expect(cells).toEqual(["Tee", "Core", "Black / M", "7"]);
	});

	it("tag the variants whose product belongs to an outfit", () => {
		render(
			<InventoryTable
				inventory={[
					InventoryResponseMother.create({
						productName: "Pure Function Tee",
						inOutfit: true,
						stock: 1,
					}),
					InventoryResponseMother.create({
						productName: "Event Storm Knit",
						inOutfit: false,
						stock: 2,
					}),
				]}
			/>,
		);

		const [, inOutfitRow, notInOutfitRow] = within(
			screen.getByRole("table", { name: "Inventory" }),
		).getAllByRole("row");

		const [productCell] = within(inOutfitRow).getAllByRole("cell");

		expect(productCell).toHaveTextContent("Pure Function Tee");
		expect(within(productCell).getByText("In outfit")).toBeInTheDocument();
		expect(notInOutfitRow).not.toHaveTextContent("In outfit");
	});

	it("show one row per variant", () => {
		render(
			<InventoryTable
				inventory={[
					InventoryResponseMother.create({ size: "S" }),
					InventoryResponseMother.create({ size: "L" }),
				]}
			/>,
		);

		const rows = within(
			screen.getByRole("table", { name: "Inventory" }),
		).getAllByRole("row");

		expect(rows).toHaveLength(3);
	});
});
