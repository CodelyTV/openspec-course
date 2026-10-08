import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { MetricCard } from "@/contexts/frontend/retail/sections/MetricCard";

describe("MetricCard should", () => {
	it("show its label, value and detail", () => {
		render(
			<MetricCard
				label="Revenue"
				value="€1,250"
				detail="Confirmed orders"
			/>,
		);

		const card = screen.getByRole("article", { name: "Revenue" });

		expect(card).toHaveTextContent("€1,250");
		expect(card).toHaveTextContent("Confirmed orders");
	});
});
