import { CodelyError } from "@/contexts/shared/domain/CodelyError";

export class InvalidOutfitSizeError extends CodelyError {
	constructor(productsCount: number) {
		super(`An outfit needs between 2 and 4 products, got ${productsCount}`);
	}
}
