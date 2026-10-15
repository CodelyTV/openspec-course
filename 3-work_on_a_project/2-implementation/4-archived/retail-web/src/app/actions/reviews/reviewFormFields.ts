import { InvalidFormDataError } from "../InvalidFormDataError";

export type ReviewFormFields = {
	productId: string;
	rating: number;
	title: string;
	body: string;
};

function requiredText(formData: FormData, field: string): string {
	const value = formData.get(field);

	if (typeof value !== "string") {
		throw new InvalidFormDataError(`${field} is required`);
	}

	return value;
}

function requiredRating(formData: FormData): number {
	const rating = formData.get("rating");
	const isNumericRating =
		typeof rating === "string" &&
		rating.trim().length > 0 &&
		!Number.isNaN(Number(rating));

	if (!isNumericRating) {
		throw new InvalidFormDataError("rating must be a number");
	}

	return Number(rating);
}

export function requiredReviewId(formData: FormData): string {
	const reviewId = requiredText(formData, "reviewId");

	if (reviewId.length === 0) {
		throw new InvalidFormDataError("reviewId is required");
	}

	return reviewId;
}

export function reviewFormFields(formData: FormData): ReviewFormFields {
	const productId = requiredText(formData, "productId");

	if (productId.length === 0) {
		throw new InvalidFormDataError("productId is required");
	}

	return {
		productId,
		rating: requiredRating(formData),
		title: requiredText(formData, "title"),
		body: requiredText(formData, "body"),
	};
}
