import { CodelyError } from "../CodelyError";

export class InvalidLiteralError extends CodelyError {
	constructor(kind: string, value: string, allowed: readonly string[]) {
		super(
			`Invalid ${kind} "${value}", expected one of: ${allowed.join(", ")}`,
		);
	}
}
