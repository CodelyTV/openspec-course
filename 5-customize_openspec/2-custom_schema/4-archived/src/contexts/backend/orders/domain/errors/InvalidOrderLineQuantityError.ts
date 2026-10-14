import { CodelyError } from "@/contexts/shared/domain/CodelyError";

export class InvalidOrderLineQuantityError extends CodelyError {
	constructor(quantity: number) {
		super(
			`Order line quantity must be a positive integer, got ${quantity}`,
		);
	}
}
