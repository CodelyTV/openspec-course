import { CodelyError } from "../CodelyError";

export class EmptyStringValueObjectError extends CodelyError {
	constructor(valueObjectName: string) {
		super(`${valueObjectName} cannot be empty`);
	}
}
