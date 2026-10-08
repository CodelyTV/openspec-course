import { CodelyError } from "@/contexts/shared/domain/CodelyError";

export class CatalogItemNotFoundError extends CodelyError {
	constructor(variantId: string) {
		super(`Variant ${variantId} is no longer in the catalog`);
	}
}
