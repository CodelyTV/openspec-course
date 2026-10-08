import { InvalidArgumentError } from "@/contexts/shared/domain/errors/InvalidArgumentError";

export type OutfitFormFields = {
	name: string;
	productIds: string[];
};

export function requiredOutfitId(formData: FormData): string {
	const id = formData.get("id");

	if (typeof id !== "string" || id.length === 0) {
		throw new InvalidArgumentError("id is required");
	}

	return id;
}

export function outfitFormFields(formData: FormData): OutfitFormFields {
	const name = formData.get("name");

	if (typeof name !== "string") {
		throw new InvalidArgumentError("name is required");
	}

	const chosenProductIds = formData
		.getAll("productIds")
		.filter(
			(productId): productId is string =>
				typeof productId === "string" && productId.length > 0,
		);

	return { name, productIds: chosenProductIds };
}
