import { CodelyError } from "@/contexts/shared/domain/CodelyError";

export class RepeatedOutfitProductError extends CodelyError {
	constructor() {
		super("A product can only appear once in an outfit");
	}
}
