import { CodelyError } from "@/contexts/shared/domain/CodelyError";

export class NotEnoughStockError extends CodelyError {
	constructor(readonly variantId: string) {
		super(`Variant ${variantId} does not have enough stock left`);
	}
}
