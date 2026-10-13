import { VariantId } from "@/contexts/shared/domain/VariantId";

import { InvalidCheckoutLineQuantityError } from "./errors/InvalidCheckoutLineQuantityError";

export type CheckoutLinePrimitives = {
	productId: string;
	variantId: string;
	quantity: number;
};

export class CheckoutLine {
	constructor(
		readonly productId: string,
		readonly variantId: VariantId,
		readonly quantity: number,
	) {
		const isPositiveInteger = Number.isInteger(quantity) && quantity > 0;

		if (!isPositiveInteger) {
			throw new InvalidCheckoutLineQuantityError(quantity);
		}
	}

	static fromPrimitives(primitives: CheckoutLinePrimitives): CheckoutLine {
		return new CheckoutLine(
			primitives.productId,
			new VariantId(primitives.variantId),
			primitives.quantity,
		);
	}

	isFor(variantId: VariantId): boolean {
		return this.variantId.equals(variantId);
	}

	withOneMore(): CheckoutLine {
		return new CheckoutLine(
			this.productId,
			this.variantId,
			this.quantity + 1,
		);
	}

	toPrimitives(): CheckoutLinePrimitives {
		return {
			productId: this.productId,
			variantId: this.variantId.value,
			quantity: this.quantity,
		};
	}
}
