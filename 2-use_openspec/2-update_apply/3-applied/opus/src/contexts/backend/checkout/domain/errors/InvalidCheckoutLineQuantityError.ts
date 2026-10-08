import { CodelyError } from "@/contexts/shared/domain/CodelyError";

export class InvalidCheckoutLineQuantityError extends CodelyError {
	constructor(quantity: number) {
		super(
			`Checkout line quantity must be a positive integer, got ${quantity}`,
		);
	}
}
