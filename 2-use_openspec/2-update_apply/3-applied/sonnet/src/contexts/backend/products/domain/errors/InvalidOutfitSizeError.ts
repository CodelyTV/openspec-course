import { CodelyError } from "@/contexts/shared/domain/CodelyError";

export class InvalidOutfitSizeError extends CodelyError {
	constructor(minProducts: number, maxProducts: number) {
		super(
			`An outfit needs between ${minProducts} and ${maxProducts} products`,
		);
	}
}
