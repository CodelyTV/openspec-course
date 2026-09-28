import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { DashboardMetrics } from "@/contexts/frontend/retail/sections/DashboardMetrics";

import { DashboardResponseMother } from "../responses/DashboardResponseMother";

describe("DashboardMetrics should", () => {
	function metric(name: string): HTMLElement {
		return within(
			screen.getByRole("region", { name: "Key metrics" }),
		).getByRole("article", { name });
	}

	it("show revenue, orders, average order and low stock", () => {
		render(
			<DashboardMetrics
				dashboard={DashboardResponseMother.create({
					revenuePerCurrency: [{ amount: 1250, currency: "EUR" }],
					ordersCount: 10,
					averageOrderPerCurrency: [{ amount: 125, currency: "EUR" }],
					lowStockCount: 4,
					lowStockThreshold: 2,
				})}
			/>,
		);

		expect(metric("Revenue")).toHaveTextContent("€1,250");
		expect(metric("Orders")).toHaveTextContent("10");
		expect(metric("Average order")).toHaveTextContent("€125");
		expect(metric("Low stock")).toHaveTextContent("4");
		expect(metric("Low stock")).toHaveTextContent("2 units or fewer");
	});

	it("show the revenue of each currency on its own", () => {
		render(
			<DashboardMetrics
				dashboard={DashboardResponseMother.create({
					revenuePerCurrency: [
						{ amount: 80, currency: "EUR" },
						{ amount: 40, currency: "USD" },
					],
				})}
			/>,
		);

		expect(metric("Revenue")).toHaveTextContent("€80 · US$40");
	});

	it("show no revenue when there are no orders", () => {
		render(
			<DashboardMetrics
				dashboard={DashboardResponseMother.create({
					revenuePerCurrency: [],
					averageOrderPerCurrency: [],
					ordersCount: 0,
				})}
			/>,
		);

		expect(metric("Revenue")).toHaveTextContent("—");
		expect(metric("Average order")).toHaveTextContent("—");
	});
});
