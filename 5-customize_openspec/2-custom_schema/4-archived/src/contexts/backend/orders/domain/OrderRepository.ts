import type { UserId } from "@/contexts/shared/domain/UserId";

import type { CurrencyRevenue } from "./CurrencyRevenue";
import type { Order } from "./Order";
import type { OrderId } from "./OrderId";

export abstract class OrderRepository {
	abstract save(order: Order): Promise<void>;

	abstract searchAll(): Promise<Order[]>;

	abstract searchLatest(limit: number): Promise<Order[]>;

	abstract search(id: OrderId): Promise<Order | null>;

	abstract searchByUser(userId: UserId): Promise<Order[]>;

	abstract revenuePerCurrency(): Promise<CurrencyRevenue[]>;
}
