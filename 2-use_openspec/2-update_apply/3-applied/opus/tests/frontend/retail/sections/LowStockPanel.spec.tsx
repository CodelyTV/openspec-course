import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { LowStockPanel } from "@/contexts/frontend/retail/sections/LowStockPanel";

import { LowStockResponseMother } from "../responses/LowStockResponseMother";

describe("LowStockPanel should", () => {
	it("list each variant running out with the units left", () => {
		render(
			<LowStockPanel
				variants={[
					LowStockResponseMother.create({
						productName: "Tee",
						color: "Black",
						size: "M",
						stock: 1,
					}),
				]}
			/>,
		);

		const [variant] = screen.getAllByRole("listitem");

		expect(variant).toHaveTextContent("Tee");
		expect(variant).toHaveTextContent("Black / M");
		expect(variant).toHaveTextContent("1 unit");
	});

	it("not tag a variant whose product belongs to no outfit", () => {
		render(
			<LowStockPanel
				variants={[LowStockResponseMother.create({ outfitCount: 0 })]}
			/>,
		);

		expect(screen.getByRole("listitem")).not.toHaveTextContent(/outfit/);
	});

	it.each([
		[1, "In 1 outfit"],
		[2, "In 2 outfits"],
	])(
		"tag a variant whose product belongs to %i outfit(s)",
		(outfitCount, tag) => {
			render(
				<LowStockPanel
					variants={[LowStockResponseMother.create({ outfitCount })]}
				/>,
			);

			expect(screen.getByRole("listitem")).toHaveTextContent(tag);
		},
	);

	it("show only the first six variants running out", () => {
		const variants = Array.from({ length: 8 }, (_, index) =>
			LowStockResponseMother.create({
				productName: `Product ${index + 1}`,
			}),
		);

		render(<LowStockPanel variants={variants} />);

		expect(screen.getAllByRole("listitem")).toHaveLength(6);
		expect(screen.getByText("Product 6")).toBeInTheDocument();
		expect(screen.queryByText("Product 7")).not.toBeInTheDocument();
	});

	it("tell there are no stock alerts when nothing is running out", () => {
		render(<LowStockPanel variants={[]} />);

		expect(screen.getByText("No stock alerts.")).toBeInTheDocument();
		expect(screen.queryByRole("list")).not.toBeInTheDocument();
	});

	it("link to the inventory", () => {
		render(<LowStockPanel variants={[]} />);

		expect(
			screen.getByRole("link", { name: "View inventory" }),
		).toHaveAttribute("href", "/admin/inventory");
	});
});
