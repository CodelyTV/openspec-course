import { CodelyError } from "@/contexts/shared/domain/CodelyError";

export class InvalidOutfitNameError extends CodelyError {
	constructor() {
		super("An outfit needs a non-blank name");
	}
}
