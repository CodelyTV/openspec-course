import { CodelyError } from "@/contexts/shared/domain/CodelyError";

export class ProductNotFoundError extends CodelyError {
	constructor(productId: string) {
		super(`Product ${productId} not found`);
	}
}
