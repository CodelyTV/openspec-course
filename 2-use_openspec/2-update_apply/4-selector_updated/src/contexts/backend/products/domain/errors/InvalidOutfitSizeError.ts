import { CodelyError } from "@/contexts/shared/domain/CodelyError";

export class InvalidOutfitSizeError extends CodelyError {
	constructor(productCount: number, min: number, max: number) {
		super(
			`An outfit needs between ${min} and ${max} products, got ${productCount}`,
		);
	}
}
