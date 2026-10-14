import { InvalidFormDataError } from "../InvalidFormDataError";

export type OutfitFormFields = {
	name: string;
	productIds: string[];
};

export function requiredOutfitId(formData: FormData): string {
	const id = formData.get("id");

	if (typeof id !== "string" || id.length === 0) {
		throw new InvalidFormDataError("id is required");
	}

	return id;
}

export function outfitFormFields(formData: FormData): OutfitFormFields {
	const name = formData.get("name");

	if (typeof name !== "string") {
		throw new InvalidFormDataError("name is required");
	}

	const chosenProductIds = formData
		.getAll("productIds")
		.filter(
			(productId): productId is string =>
				typeof productId === "string" && productId.length > 0,
		);

	return { name, productIds: chosenProductIds };
}
