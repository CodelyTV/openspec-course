import { CodelyError } from "@/contexts/shared/domain/CodelyError";

export class ReviewAlreadyExistsError extends CodelyError {
	constructor(productId: string) {
		super(`The customer already reviewed product ${productId}`);
	}
}
