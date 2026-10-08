import { InvalidArgumentError } from "@/contexts/shared/domain/errors/InvalidArgumentError";

export function requiredOutfitId(formData: FormData): string {
	const outfitId = formData.get("outfitId");

	if (typeof outfitId !== "string" || outfitId.length === 0) {
		throw new InvalidArgumentError("outfitId is required");
	}

	return outfitId;
}

export function outfitName(formData: FormData): string {
	const name = formData.get("name");

	return typeof name === "string" ? name : "";
}

export function selectedProductIds(formData: FormData): string[] {
	return formData
		.getAll("productIds")
		.filter(
			(productId): productId is string =>
				typeof productId === "string" && productId.length > 0,
		);
}
