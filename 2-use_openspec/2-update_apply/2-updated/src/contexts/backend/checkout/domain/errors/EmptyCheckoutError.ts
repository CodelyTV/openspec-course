import { CodelyError } from "@/contexts/shared/domain/CodelyError";

export class EmptyCheckoutError extends CodelyError {
	constructor() {
		super("Cannot confirm an empty checkout");
	}
}
