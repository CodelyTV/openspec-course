import { CodelyError } from "@/contexts/shared/domain/CodelyError";

export class EmptyOutfitNameError extends CodelyError {
	constructor() {
		super(`An outfit name is required.`);
	}
}
