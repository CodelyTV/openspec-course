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
