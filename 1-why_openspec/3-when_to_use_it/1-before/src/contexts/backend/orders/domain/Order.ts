import type { DeliveryMethod } from "@/contexts/shared/domain/DeliveryMethod";
import { Money, type MoneyPrimitives } from "@/contexts/shared/domain/Money";
import { parseLiteral } from "@/contexts/shared/domain/parseLiteral";
import { UserId } from "@/contexts/shared/domain/UserId";

import { EmptyOrderError } from "./errors/EmptyOrderError";
import { OrderId } from "./OrderId";
import { OrderLine, type OrderLinePrimitives } from "./OrderLine";

export const orderStatuses = ["confirmed"] as const;

export type OrderStatus = (typeof orderStatuses)[number];

export function parseOrderStatus(value: string): OrderStatus {
	return parseLiteral("order status", orderStatuses, value);
}

export type OrderPrimitives = {
	id: string;
	userId: string;
	createdAt: string;
	deliveryMethod: DeliveryMethod;
	status: OrderStatus;
	subtotal: MoneyPrimitives;
	lines: OrderLinePrimitives[];
};

export class Order {
	constructor(
		readonly id: OrderId,
		readonly userId: UserId,
		readonly createdAt: Date,
		readonly deliveryMethod: DeliveryMethod,
		readonly status: OrderStatus,
		readonly subtotal: Money,
		readonly lines: OrderLine[],
	) {}

	static place(
		id: OrderId,
		userId: UserId,
		createdAt: Date,
		deliveryMethod: DeliveryMethod,
		lines: OrderLine[],
	): Order {
		if (lines.length === 0) {
			throw new EmptyOrderError();
		}

		const subtotal = lines
			.map((line) => line.lineTotal())
			.reduce((total, lineTotal) => total.add(lineTotal));

		return new Order(
			id,
			userId,
			createdAt,
			deliveryMethod,
			"confirmed",
			subtotal,
			lines,
		);
	}

	static fromPrimitives(primitives: OrderPrimitives): Order {
		return new Order(
			new OrderId(primitives.id),
			new UserId(primitives.userId),
			new Date(primitives.createdAt),
			primitives.deliveryMethod,
			primitives.status,
			Money.fromPrimitives(primitives.subtotal),
			primitives.lines.map(OrderLine.fromPrimitives),
		);
	}

	items(): number {
		return this.lines.reduce((total, line) => total + line.quantity, 0);
	}

	toPrimitives(): OrderPrimitives {
		return {
			id: this.id.value,
			userId: this.userId.value,
			createdAt: this.createdAt.toISOString(),
			deliveryMethod: this.deliveryMethod,
			status: this.status,
			subtotal: this.subtotal.toPrimitives(),
			lines: this.lines.map((line) => line.toPrimitives()),
		};
	}
}
