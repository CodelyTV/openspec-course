import { Money, type MoneyPrimitives } from "@/contexts/shared/domain/Money";

import { InvalidOrderLineQuantityError } from "./errors/InvalidOrderLineQuantityError";

export type OrderLinePrimitives = {
	productId: string;
	variantId: string;
	quantity: number;
	unitPrice: MoneyPrimitives;
};

export class OrderLine {
	constructor(
		readonly productId: string,
		readonly variantId: string,
		readonly quantity: number,
		readonly unitPrice: Money,
	) {
		const isPositiveInteger = Number.isInteger(quantity) && quantity > 0;

		if (!isPositiveInteger) {
			throw new InvalidOrderLineQuantityError(quantity);
		}
	}

	static fromPrimitives(primitives: OrderLinePrimitives): OrderLine {
		return new OrderLine(
			primitives.productId,
			primitives.variantId,
			primitives.quantity,
			Money.fromPrimitives(primitives.unitPrice),
		);
	}

	lineTotal(): Money {
		return this.unitPrice.multiply(this.quantity);
	}

	toPrimitives(): OrderLinePrimitives {
		return {
			productId: this.productId,
			variantId: this.variantId,
			quantity: this.quantity,
			unitPrice: this.unitPrice.toPrimitives(),
		};
	}
}
