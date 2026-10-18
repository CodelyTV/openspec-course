import { InvalidArgumentError } from "@/contexts/shared/domain/errors/InvalidArgumentError";

export function requiredProductId(formData: FormData): string {
	const productId = formData.get("productId");

	if (typeof productId !== "string" || productId.length === 0) {
		throw new InvalidArgumentError("productId is required");
	}

	return productId;
}
