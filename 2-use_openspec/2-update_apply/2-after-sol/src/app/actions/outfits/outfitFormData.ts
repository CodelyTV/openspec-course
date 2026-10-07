import { InvalidArgumentError } from "@/contexts/shared/domain/errors/InvalidArgumentError";

function stringField(formData: FormData, field: string): string {
	const value = formData.get(field);
	if (typeof value !== "string") {
		throw new InvalidArgumentError(`Invalid ${field}`);
	}

	return value;
}
export function outfitFormData(formData: FormData): {
	name: string;
	productIds: string[];
} {
	return {
		name: stringField(formData, "name"),
		productIds: [0, 1, 2, 3]
			.map((index) => stringField(formData, `piece-${index}`))
			.filter((id) => id !== ""),
	};
}
export function outfitId(formData: FormData): string {
	return stringField(formData, "id");
}
