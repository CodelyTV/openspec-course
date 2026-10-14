import { describe, expect, it } from "vitest";

import { OrdersSummaryGetter } from "@/contexts/backend/orders/application/summarize/OrdersSummaryGetter";
import type { CurrencyRevenue } from "@/contexts/backend/orders/domain/CurrencyRevenue";
import type { OrderRepository } from "@/contexts/backend/orders/domain/OrderRepository";
import { Money, type MoneyPrimitives } from "@/contexts/shared/domain/Money";

import { Mock } from "../../../../shared/Mock";

describe("OrdersSummaryGetter should", () => {
	const orderRepository = Mock.create<OrderRepository>();
	const getter = new OrdersSummaryGetter(orderRepository);

	function revenueOf(
		revenue: MoneyPrimitives,
		ordersCount: number,
	): CurrencyRevenue {
		return { revenue: Money.fromPrimitives(revenue), ordersCount };
	}

	it("sum the revenue of the orders and round their average", async () => {
		orderRepository.revenuePerCurrencyShouldReturn([
			revenueOf({ amount: 55, currency: "EUR" }, 3),
		]);

		expect(await getter.get()).toEqual({
			ordersCount: 3,
			revenuePerCurrency: [{ amount: 55, currency: "EUR" }],
			averageOrderPerCurrency: [{ amount: 18, currency: "EUR" }],
		});
	});

	it("keep the revenue of each currency apart, sorted by currency", async () => {
		orderRepository.revenuePerCurrencyShouldReturn([
			revenueOf({ amount: 40, currency: "USD" }, 1),
			revenueOf({ amount: 80, currency: "EUR" }, 2),
		]);

		expect(await getter.get()).toEqual({
			ordersCount: 3,
			revenuePerCurrency: [
				{ amount: 80, currency: "EUR" },
				{ amount: 40, currency: "USD" },
			],
			averageOrderPerCurrency: [
				{ amount: 40, currency: "EUR" },
				{ amount: 40, currency: "USD" },
			],
		});
	});

	it("report no revenue when there are no orders", async () => {
		orderRepository.revenuePerCurrencyShouldReturn([]);

		expect(await getter.get()).toEqual({
			ordersCount: 0,
			revenuePerCurrency: [],
			averageOrderPerCurrency: [],
		});
	});
});
