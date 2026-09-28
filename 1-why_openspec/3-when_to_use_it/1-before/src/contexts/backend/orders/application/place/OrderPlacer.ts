import type { UserId } from "@/contexts/backend/users/domain/UserId";
import type { Clock } from "@/contexts/shared/domain/Clock";
import type { DeliveryMethod } from "@/contexts/shared/domain/DeliveryMethod";
import type { IdGenerator } from "@/contexts/shared/domain/IdGenerator";
import { Money, type MoneyPrimitives } from "@/contexts/shared/domain/Money";

import { Order } from "../../domain/Order";
import { OrderId } from "../../domain/OrderId";
import { OrderLine } from "../../domain/OrderLine";
import type { OrderRepository } from "../../domain/OrderRepository";

export type PlaceOrderLine = {
	productId: string;
	variantId: string;
	quantity: number;
	unitPrice: MoneyPrimitives;
};

export class OrderPlacer {
	constructor(
		private readonly repository: OrderRepository,
		private readonly idGenerator: IdGenerator,
		private readonly clock: Clock,
	) {}

	async place(
		userId: UserId,
		deliveryMethod: DeliveryMethod,
		lines: PlaceOrderLine[],
	): Promise<string> {
		const order = Order.place(
			new OrderId(this.idGenerator.generate()),
			userId,
			this.clock.now(),
			deliveryMethod,
			lines.map(
				(line) =>
					new OrderLine(
						line.productId,
						line.variantId,
						line.quantity,
						Money.fromPrimitives(line.unitPrice),
					),
			),
		);

		await this.repository.save(order);

		return order.id.value;
	}
}
