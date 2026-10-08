import { InvalidArgumentError } from "@/contexts/shared/domain/errors/InvalidArgumentError";

export function outfitIdFrom(formData: FormData): string {
	const outfitId = formData.get("outfitId");

	if (typeof outfitId !== "string" || outfitId.length === 0) {
		throw new InvalidArgumentError("outfitId is required");
	}

	return outfitId;
}

export function outfitNameFrom(formData: FormData): string {
	const name = formData.get("name");

	return typeof name === "string" ? name : "";
}

export function outfitProductIdsFrom(formData: FormData): string[] {
	return formData
		.getAll("productIds")
		.flatMap((productId) =>
			typeof productId === "string" && productId.length > 0
				? [productId]
				: [],
		);
}
