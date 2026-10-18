import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { InventoryTable } from "@/contexts/frontend/retail/sections/InventoryTable";

import { InventoryResponseMother } from "../responses/InventoryResponseMother";

describe("InventoryTable should", () => {
	it("show each variant with its product, collection, stock, waiting and wishlisted customers", () => {
		render(
			<InventoryTable
				inventory={[
					InventoryResponseMother.create({
						productName: "Tee",
						collection: "Core",
						color: "Black",
						size: "M",
						stock: 7,
						waiting: 2,
						wishlisted: 4,
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

		expect(cells).toEqual(["Tee", "Core", "Black / M", "7", "2", "4"]);
	});

	it("show 0 waiting customers for a variant nobody is waiting for", () => {
		render(
			<InventoryTable
				inventory={[
					InventoryResponseMother.create({ stock: 6, waiting: 0 }),
				]}
			/>,
		);

		const table = screen.getByRole("table", { name: "Inventory" });
		const headers = within(table)
			.getAllByRole("columnheader")
			.map((header) => header.textContent);
		const [, variantRow] = within(table).getAllByRole("row");
		const cells = within(variantRow)
			.getAllByRole("cell")
			.map((cell) => cell.textContent);

		expect(cells[headers.indexOf("Waiting")]).toBe("0");
	});

	it('show the "Wishlisted" column with each row\'s count', () => {
		render(
			<InventoryTable
				inventory={[InventoryResponseMother.create({ wishlisted: 2 })]}
			/>,
		);

		const table = screen.getByRole("table", { name: "Inventory" });
		const headers = within(table)
			.getAllByRole("columnheader")
			.map((header) => header.textContent);
		const [, variantRow] = within(table).getAllByRole("row");
		const cells = within(variantRow)
			.getAllByRole("cell")
			.map((cell) => cell.textContent);

		expect(headers.indexOf("Wishlisted")).toBe(
			headers.indexOf("Waiting") + 1,
		);
		expect(cells[headers.indexOf("Wishlisted")]).toBe("2");
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
