import { InvalidFormDataError } from "../InvalidFormDataError";

export function requiredVariantId(formData: FormData): string {
	const variantId = formData.get("variantId");

	if (typeof variantId !== "string" || variantId.length === 0) {
		throw new InvalidFormDataError("variantId is required");
	}

	return variantId;
}
