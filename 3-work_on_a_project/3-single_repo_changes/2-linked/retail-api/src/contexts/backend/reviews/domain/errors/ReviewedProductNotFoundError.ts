import { CodelyError } from "@/contexts/shared/domain/CodelyError";

export class ReviewedProductNotFoundError extends CodelyError {
	constructor(productId: string) {
		super(`Reviewed product ${productId} not found in the catalog`);
	}
}
