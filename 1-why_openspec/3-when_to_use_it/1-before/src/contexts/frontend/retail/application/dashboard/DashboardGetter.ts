import type {
	OrderResponse,
	OrdersLister,
} from "@/contexts/backend/orders/application/list/OrdersLister";
import type {
	LowStockLister,
	LowStockResponse,
} from "@/contexts/backend/products/application/low-stock/LowStockLister";
import {
	type Currency,
	Money,
	type MoneyPrimitives,
} from "@/contexts/shared/domain/Money";

export type DashboardResponse = {
	revenuePerCurrency: MoneyPrimitives[];
	averageOrderPerCurrency: MoneyPrimitives[];
	ordersCount: number;
	lowStockThreshold: number;
	lowStockCount: number;
	lowStock: LowStockResponse[];
	recentOrders: OrderResponse[];
};

type CurrencyRevenue = {
	revenue: Money;
	ordersCount: number;
};

const recentOrdersShown = 5;
const lowStockVariantsShown = 6;

export class DashboardGetter {
	constructor(
		private readonly ordersLister: OrdersLister,
		private readonly lowStockLister: LowStockLister,
	) {}

	async get(): Promise<DashboardResponse> {
		const [orders, lowStockReport] = await Promise.all([
			this.ordersLister.list(),
			this.lowStockLister.list(),
		]);

		const revenues = this.revenuePerCurrency(orders);

		return {
			revenuePerCurrency: revenues.map(({ revenue }) =>
				revenue.toPrimitives(),
			),
			averageOrderPerCurrency: revenues.map(({ revenue, ordersCount }) =>
				new Money(
					Math.round(revenue.amount / ordersCount),
					revenue.currency,
				).toPrimitives(),
			),
			ordersCount: orders.length,
			lowStockThreshold: lowStockReport.threshold,
			lowStockCount: lowStockReport.variants.length,
			lowStock: lowStockReport.variants.slice(0, lowStockVariantsShown),
			recentOrders: orders.slice(0, recentOrdersShown),
		};
	}

	private revenuePerCurrency(orders: OrderResponse[]): CurrencyRevenue[] {
		const revenueByCurrency = new Map<Currency, CurrencyRevenue>();

		for (const order of orders) {
			const subtotal = new Money(order.subtotalAmount, order.currency);
			const accumulated = revenueByCurrency.get(order.currency);

			revenueByCurrency.set(order.currency, {
				revenue: accumulated
					? accumulated.revenue.add(subtotal)
					: subtotal,
				ordersCount: (accumulated?.ordersCount ?? 0) + 1,
			});
		}

		return [...revenueByCurrency.values()].sort((a, b) =>
			a.revenue.currency.localeCompare(b.revenue.currency),
		);
	}
}
