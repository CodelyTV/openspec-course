import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { DashboardMetrics } from "@/contexts/frontend/retail/sections/DashboardMetrics";

import { LowStockReportResponseMother } from "../responses/LowStockReportResponseMother";
import { LowStockResponseMother } from "../responses/LowStockResponseMother";
import { OrdersSummaryResponseMother } from "../responses/OrdersSummaryResponseMother";

describe("DashboardMetrics should", () => {
	function metric(name: string): HTMLElement {
		return within(
			screen.getByRole("region", { name: "Key metrics" }),
		).getByRole("article", { name });
	}

	it("show revenue, orders, average order and low stock", () => {
		render(
			<DashboardMetrics
				ordersSummary={OrdersSummaryResponseMother.create({
					revenuePerCurrency: [{ amount: 1250, currency: "EUR" }],
					ordersCount: 10,
					averageOrderPerCurrency: [{ amount: 125, currency: "EUR" }],
				})}
				lowStockReport={LowStockReportResponseMother.create({
					threshold: 2,
					variants: Array.from({ length: 4 }, () =>
						LowStockResponseMother.create(),
					),
				})}
			/>,
		);

		expect(metric("Revenue")).toHaveTextContent("€1,250");
		expect(metric("Orders")).toHaveTextContent("10");
		expect(metric("Average order")).toHaveTextContent("€125");
		expect(metric("Low stock")).toHaveTextContent("4");
		expect(metric("Low stock")).toHaveTextContent("2 units or fewer");
	});

	it("count every low stock variant", () => {
		render(
			<DashboardMetrics
				ordersSummary={OrdersSummaryResponseMother.create()}
				lowStockReport={LowStockReportResponseMother.create({
					threshold: 2,
					variants: Array.from({ length: 8 }, () =>
						LowStockResponseMother.create(),
					),
				})}
			/>,
		);

		expect(metric("Low stock")).toHaveTextContent("8");
	});

	it("show the revenue of each currency on its own", () => {
		render(
			<DashboardMetrics
				ordersSummary={OrdersSummaryResponseMother.create({
					revenuePerCurrency: [
						{ amount: 80, currency: "EUR" },
						{ amount: 40, currency: "USD" },
					],
				})}
				lowStockReport={LowStockReportResponseMother.create()}
			/>,
		);

		expect(metric("Revenue")).toHaveTextContent("€80 · US$40");
	});

	it("show no revenue when there are no orders", () => {
		render(
			<DashboardMetrics
				ordersSummary={OrdersSummaryResponseMother.create({
					revenuePerCurrency: [],
					averageOrderPerCurrency: [],
					ordersCount: 0,
				})}
				lowStockReport={LowStockReportResponseMother.create()}
			/>,
		);

		expect(metric("Revenue")).toHaveTextContent("—");
		expect(metric("Average order")).toHaveTextContent("—");
	});
});
