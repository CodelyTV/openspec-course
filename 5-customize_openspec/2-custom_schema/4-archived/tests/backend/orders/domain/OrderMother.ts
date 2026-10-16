import { faker } from "@faker-js/faker";

import {
	Order,
	type OrderPrimitives,
} from "@/contexts/backend/orders/domain/Order";
import type { OrderLinePrimitives } from "@/contexts/backend/orders/domain/OrderLine";
import type { MoneyPrimitives } from "@/contexts/shared/domain/Money";

import { OrderLineMother } from "./OrderLineMother";

function subtotalOf(lines: OrderLinePrimitives[]): MoneyPrimitives {
	return {
		amount: lines.reduce(
			(total, line) => total + line.unitPrice.amount * line.quantity,
			0,
		),
		currency: lines[0]?.unitPrice.currency ?? "EUR",
	};
}

const referenceDate = new Date("2026-09-28T12:00:00.000Z");

export class OrderMother {
	static create(overrides: Partial<OrderPrimitives> = {}): Order {
		return Order.fromPrimitives(OrderMother.createPrimitives(overrides));
	}

	static cancelled(overrides: Partial<OrderPrimitives> = {}): Order {
		return OrderMother.create({ ...overrides, status: "cancelled" });
	}

	static createPrimitives(
		overrides: Partial<OrderPrimitives> = {},
	): OrderPrimitives {
		const lines = overrides.lines ?? [OrderLineMother.createPrimitives()];

		return {
			id: faker.string.uuid(),
			userId: `user-${faker.string.alphanumeric(8)}`,
			createdAt: faker.date
				.recent({
					refDate: referenceDate,
				})
				.toISOString(),
			deliveryMethod: "home-delivery",
			status: "confirmed",
			subtotal: subtotalOf(lines),
			...overrides,
			lines,
		};
	}
}
