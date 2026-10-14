import { CodelyError } from "../CodelyError";

export class CurrencyMismatchError extends CodelyError {
	constructor(expected: string, actual: string) {
		super(`Cannot operate ${expected} with ${actual}`);
	}
}
