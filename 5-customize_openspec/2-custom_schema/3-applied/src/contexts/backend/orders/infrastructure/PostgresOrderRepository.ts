import { PostgresRepository } from "@/contexts/backend/shared/infrastructure/PostgresRepository";
import { parseDeliveryMethod } from "@/contexts/shared/domain/DeliveryMethod";
import { Money, parseCurrency } from "@/contexts/shared/domain/Money";
import type { UserId } from "@/contexts/shared/domain/UserId";

import type { CurrencyRevenue } from "../domain/CurrencyRevenue";
import { Order, parseOrderStatus } from "../domain/Order";
import type { OrderId } from "../domain/OrderId";
import type { OrderRepository } from "../domain/OrderRepository";

type OrderRow = {
	id: string;
	user_id: string;
	created_at: Date;
	status: string;
	delivery_method: string;
	subtotal_amount: number;
	currency: string;
};

type OrderLineRow = {
	order_id: string;
	product_id: string;
	variant_id: string;
	product_name: string;
	color: string;
	size: string;
	quantity: number;
	unit_price_amount: number;
};

type CurrencyRevenueRow = {
	currency: string;
	revenue_amount: number;
	orders_count: number;
};

export class PostgresOrderRepository
	extends PostgresRepository
	implements OrderRepository
{
	async save(order: Order): Promise<void> {
		const primitives = order.toPrimitives();

		await this.transaction(async () => {
			const sql = this.sql;

			await sql`
				insert into orders (id, user_id, delivery_method, subtotal_amount, currency, status, created_at)
				values (
					${primitives.id},
					${primitives.userId},
					${primitives.deliveryMethod},
					${primitives.subtotal.amount},
					${primitives.subtotal.currency},
					${primitives.status},
					${order.createdAt}
				)
			`;

			await sql`
				insert into order_lines ${sql(
					primitives.lines.map((line) => ({
						order_id: primitives.id,
						product_id: line.productId,
						variant_id: line.variantId,
						product_name: line.productName,
						color: line.color,
						size: line.size,
						quantity: line.quantity,
						unit_price_amount: line.unitPrice.amount,
					})),
					"order_id",
					"product_id",
					"variant_id",
					"product_name",
					"color",
					"size",
					"quantity",
					"unit_price_amount",
				)}
			`;
		});
	}

	async searchAll(): Promise<Order[]> {
		const [orderRows, lineRows] = await Promise.all([
			this.sql<OrderRow[]>`
				select id, user_id, created_at, status, delivery_method, subtotal_amount, currency
				from orders
				order by created_at desc
			`,
			this.sql<OrderLineRow[]>`
				select order_id, product_id, variant_id, product_name, color, size, quantity, unit_price_amount
				from order_lines
			`,
		]);

		return orderRows.map((order) => this.toOrder(order, lineRows));
	}

	async searchLatest(limit: number): Promise<Order[]> {
		const orderRows = await this.sql<OrderRow[]>`
			select id, user_id, created_at, status, delivery_method, subtotal_amount, currency
			from orders
			order by created_at desc
			limit ${limit}
		`;

		return this.withLines(orderRows);
	}

	async search(id: OrderId): Promise<Order | null> {
		const order = (
			await this.sql<OrderRow[]>`
				select id, user_id, created_at, status, delivery_method, subtotal_amount, currency
				from orders
				where id = ${id.value}
			`
		).at(0);

		if (!order) {
			return null;
		}

		const [found] = await this.withLines([order]);

		return found;
	}

	async searchByUser(userId: UserId): Promise<Order[]> {
		const orderRows = await this.sql<OrderRow[]>`
			select id, user_id, created_at, status, delivery_method, subtotal_amount, currency
			from orders
			where user_id = ${userId.value}
			order by created_at desc
		`;

		return this.withLines(orderRows);
	}

	async cancel(id: OrderId): Promise<boolean> {
		const result = await this.sql`
			update orders
			set status = 'cancelled'
			where id = ${id.value} and status = 'confirmed'
		`;

		return result.count === 1;
	}

	async revenuePerCurrency(): Promise<CurrencyRevenue[]> {
		const rows = await this.sql<CurrencyRevenueRow[]>`
			select currency, sum(subtotal_amount)::int as revenue_amount, count(*)::int as orders_count
			from orders
			group by currency
			order by currency
		`;

		return rows.map((row) => ({
			revenue: new Money(row.revenue_amount, parseCurrency(row.currency)),
			ordersCount: row.orders_count,
		}));
	}

	private async withLines(orderRows: OrderRow[]): Promise<Order[]> {
		const lineRows = await this.sql<OrderLineRow[]>`
			select order_id, product_id, variant_id, product_name, color, size, quantity, unit_price_amount
			from order_lines
			where order_id = any(${orderRows.map((order) => order.id)})
		`;

		return orderRows.map((order) => this.toOrder(order, lineRows));
	}

	private toOrder(order: OrderRow, lineRows: OrderLineRow[]): Order {
		const currency = parseCurrency(order.currency);

		return Order.fromPrimitives({
			id: order.id,
			userId: order.user_id,
			createdAt: order.created_at.toISOString(),
			deliveryMethod: parseDeliveryMethod(order.delivery_method),
			status: parseOrderStatus(order.status),
			subtotal: { amount: order.subtotal_amount, currency },
			lines: lineRows
				.filter((line) => line.order_id === order.id)
				.map((line) => ({
					productId: line.product_id,
					variantId: line.variant_id,
					productName: line.product_name,
					color: line.color,
					size: line.size,
					quantity: line.quantity,
					unitPrice: { amount: line.unit_price_amount, currency },
				})),
		});
	}
}
