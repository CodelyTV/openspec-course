import { InvalidLiteralError } from "./errors/InvalidLiteralError";

export function parseLiteral<T extends string>(
	kind: string,
	allowed: readonly T[],
	value: string,
): T {
	const isAllowed = (candidate: string): candidate is T =>
		(allowed as readonly string[]).includes(candidate);

	if (!isAllowed(value)) {
		throw new InvalidLiteralError(kind, value, allowed);
	}

	return value;
}
