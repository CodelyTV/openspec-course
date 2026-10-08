import { CodelyError } from "@/contexts/shared/domain/CodelyError";

export class OutfitProductNotFoundError extends CodelyError {
	constructor(productId: string) {
		super(`Product ${productId} of the outfit not found`);
	}
}
