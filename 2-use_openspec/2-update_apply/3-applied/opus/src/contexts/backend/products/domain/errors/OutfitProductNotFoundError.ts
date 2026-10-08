import { CodelyError } from "@/contexts/shared/domain/CodelyError";

export class OutfitProductNotFoundError extends CodelyError {
	constructor(productId: string) {
		super(`Outfit product ${productId} not found in the catalog`);
	}
}
