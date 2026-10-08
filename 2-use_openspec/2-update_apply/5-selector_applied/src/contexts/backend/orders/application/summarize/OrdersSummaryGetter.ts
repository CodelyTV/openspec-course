import { Money, type MoneyPrimitives } from "@/contexts/shared/domain/Money";

import type { CurrencyRevenue } from "../../domain/CurrencyRevenue";
import type { OrderRepository } from "../../domain/OrderRepository";

export type OrdersSummaryResponse = {
	ordersCount: number;
	revenuePerCurrency: MoneyPrimitives[];
	averageOrderPerCurrency: MoneyPrimitives[];
};

export class OrdersSummaryGetter {
	constructor(private readonly repository: OrderRepository) {}

	async get(): Promise<OrdersSummaryResponse> {
		const revenues = (await this.repository.revenuePerCurrency()).sort(
			(a, b) => a.revenue.currency.localeCompare(b.revenue.currency),
		);

		return {
			ordersCount: revenues.reduce(
				(total, { ordersCount }) => total + ordersCount,
				0,
			),
			revenuePerCurrency: revenues.map(({ revenue }) =>
				revenue.toPrimitives(),
			),
			averageOrderPerCurrency: revenues.map((revenue) =>
				this.averageOrderOf(revenue).toPrimitives(),
			),
		};
	}

	private averageOrderOf({ revenue, ordersCount }: CurrencyRevenue): Money {
		return new Money(
			Math.round(revenue.amount / ordersCount),
			revenue.currency,
		);
	}
}
