import { CodelyError } from "@/contexts/shared/domain/CodelyError";

export class RepeatedOutfitProductError extends CodelyError {
	constructor(productId: string) {
		super(`Product ${productId} appears more than once in the outfit`);
	}
}
