import { beforeEach, describe, expect, it } from "vitest";

import type { OrdersLister } from "@/contexts/backend/orders/application/list/OrdersLister";
import type { LowStockLister } from "@/contexts/backend/products/application/low-stock/LowStockLister";
import { DashboardGetter } from "@/contexts/frontend/retail/application/dashboard/DashboardGetter";

import { Mock } from "../../../../shared/Mock";
import { LowStockResponseMother } from "../../responses/LowStockResponseMother";
import { OrderResponseMother } from "../../responses/OrderResponseMother";

describe("DashboardGetter should", () => {
	const ordersLister = Mock.create<OrdersLister>();
	const lowStockLister = Mock.create<LowStockLister>();
	const getter = new DashboardGetter(ordersLister, lowStockLister);
	const threshold = 2;

	beforeEach(() => {
		ordersLister.listShouldReturn([]);
		lowStockLister.listShouldReturn({ threshold, variants: [] });
	});

	it("sum the revenue of the orders and round their average", async () => {
		ordersLister.listShouldReturn([
			OrderResponseMother.create({ subtotalAmount: 10, currency: "EUR" }),
			OrderResponseMother.create({ subtotalAmount: 20, currency: "EUR" }),
			OrderResponseMother.create({ subtotalAmount: 25, currency: "EUR" }),
		]);

		const dashboard = await getter.get();

		expect(dashboard.ordersCount).toBe(3);
		expect(dashboard.revenuePerCurrency).toEqual([
			{ amount: 55, currency: "EUR" },
		]);
		expect(dashboard.averageOrderPerCurrency).toEqual([
			{ amount: 18, currency: "EUR" },
		]);
	});

	it("keep the revenue of each currency apart instead of mixing them", async () => {
		ordersLister.listShouldReturn([
			OrderResponseMother.create({ subtotalAmount: 40, currency: "USD" }),
			OrderResponseMother.create({ subtotalAmount: 30, currency: "EUR" }),
			OrderResponseMother.create({ subtotalAmount: 50, currency: "EUR" }),
		]);

		const dashboard = await getter.get();

		expect(dashboard.revenuePerCurrency).toEqual([
			{ amount: 80, currency: "EUR" },
			{ amount: 40, currency: "USD" },
		]);
		expect(dashboard.averageOrderPerCurrency).toEqual([
			{ amount: 40, currency: "EUR" },
			{ amount: 40, currency: "USD" },
		]);
	});

	it("report no revenue when there are no orders", async () => {
		const dashboard = await getter.get();

		expect(dashboard.ordersCount).toBe(0);
		expect(dashboard.revenuePerCurrency).toEqual([]);
		expect(dashboard.averageOrderPerCurrency).toEqual([]);
		expect(dashboard.recentOrders).toEqual([]);
	});

	it("show only the five most recent orders", async () => {
		const orders = Array.from({ length: 7 }, () =>
			OrderResponseMother.create(),
		);
		ordersLister.listShouldReturn(orders);

		expect((await getter.get()).recentOrders).toEqual(orders.slice(0, 5));
	});

	it("show the first six low stock variants while counting all of them", async () => {
		const variants = Array.from({ length: 8 }, () =>
			LowStockResponseMother.create(),
		);
		lowStockLister.listShouldReturn({ threshold, variants });

		const dashboard = await getter.get();

		expect(dashboard.lowStockThreshold).toBe(threshold);
		expect(dashboard.lowStockCount).toBe(8);
		expect(dashboard.lowStock).toEqual(variants.slice(0, 6));
	});
});
