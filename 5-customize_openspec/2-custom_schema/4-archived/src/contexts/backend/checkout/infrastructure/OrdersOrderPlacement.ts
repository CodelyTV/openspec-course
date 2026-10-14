import type {
	OrderPlacer,
	PlaceOrderLine,
} from "@/contexts/backend/orders/application/place/OrderPlacer";
import type { DeliveryMethod } from "@/contexts/shared/domain/DeliveryMethod";
import type { UserId } from "@/contexts/shared/domain/UserId";

import {
	OrderPlacement,
	type OrderPlacementLine,
} from "../domain/OrderPlacement";

export class OrdersOrderPlacement extends OrderPlacement {
	constructor(private readonly orderPlacer: OrderPlacer) {
		super();
	}

	async place(
		userId: UserId,
		deliveryMethod: DeliveryMethod,
		lines: OrderPlacementLine[],
	): Promise<string> {
		return this.orderPlacer.place(
			userId,
			deliveryMethod,
			lines.map(toPlaceOrderLine),
		);
	}
}

function toPlaceOrderLine(line: OrderPlacementLine): PlaceOrderLine {
	return {
		productId: line.productId,
		variantId: line.variantId.value,
		productName: line.productName,
		color: line.color,
		size: line.size,
		quantity: line.quantity,
		unitPrice: line.unitPrice.toPrimitives(),
	};
}
