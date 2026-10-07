import { InvalidArgumentError } from "@/contexts/shared/domain/errors/InvalidArgumentError";

export function requiredVariantId(formData: FormData): string {
	const variantId = formData.get("variantId");

	if (typeof variantId !== "string" || variantId.length === 0) {
		throw new InvalidArgumentError("variantId is required");
	}

	return variantId;
}
