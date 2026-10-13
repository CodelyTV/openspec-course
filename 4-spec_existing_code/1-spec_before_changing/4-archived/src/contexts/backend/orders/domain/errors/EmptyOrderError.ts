import { CodelyError } from "@/contexts/shared/domain/CodelyError";

export class EmptyOrderError extends CodelyError {
	constructor() {
		super("An order needs at least one line");
	}
}
