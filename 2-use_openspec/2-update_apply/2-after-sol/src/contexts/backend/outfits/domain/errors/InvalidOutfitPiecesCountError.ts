import { CodelyError } from "@/contexts/shared/domain/CodelyError";

export class InvalidOutfitPiecesCountError extends CodelyError {
	constructor() {
		super(`An outfit needs between 2 and 4 products.`);
	}
}
