import type { Money } from "@/contexts/shared/domain/Money";

export type CurrencyRevenue = {
	revenue: Money;
	ordersCount: number;
};
