import { InvalidArgumentError } from "@/contexts/shared/domain/errors/InvalidArgumentError";

export type RequestBody = Record<string, unknown>;

export async function jsonBodyOf(request: Request): Promise<RequestBody> {
	const body: unknown = await request.json().catch(() => {
		throw new InvalidArgumentError("The request body must be valid JSON");
	});

	if (typeof body !== "object" || body === null || Array.isArray(body)) {
		throw new InvalidArgumentError(
			"The request body must be a JSON object",
		);
	}

	return body as RequestBody;
}

export function requiredString(body: RequestBody, field: string): string {
	const value = body[field];

	if (typeof value !== "string") {
		throw new InvalidArgumentError(`${field} must be a string`);
	}

	return value;
}

export function requiredNumber(body: RequestBody, field: string): number {
	const value = body[field];

	if (typeof value !== "number" || !Number.isFinite(value)) {
		throw new InvalidArgumentError(`${field} must be a number`);
	}

	return value;
}

export function requiredStringArray(
	body: RequestBody,
	field: string,
): string[] {
	const value = body[field];
	const isStringArray =
		Array.isArray(value) && value.every((item) => typeof item === "string");

	if (!isStringArray) {
		throw new InvalidArgumentError(`${field} must be an array of strings`);
	}

	return value;
}
