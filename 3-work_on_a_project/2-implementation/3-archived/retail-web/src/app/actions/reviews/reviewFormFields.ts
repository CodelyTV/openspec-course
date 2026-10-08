import type { ReviewSubmission } from "@/contexts/frontend/retail/api/responses";

import { InvalidFormDataError } from "../InvalidFormDataError";

function requiredField(formData: FormData, field: string): string {
	const value = formData.get(field);

	if (typeof value !== "string") {
		throw new InvalidFormDataError(`${field} is required`);
	}

	return value;
}

function requiredNonEmptyField(formData: FormData, field: string): string {
	const value = requiredField(formData, field);

	if (value.length === 0) {
		throw new InvalidFormDataError(`${field} is required`);
	}

	return value;
}

export function requiredReviewId(formData: FormData): string {
	return requiredNonEmptyField(formData, "id");
}

export function reviewSubmissionOf(formData: FormData): ReviewSubmission {
	return {
		productId: requiredNonEmptyField(formData, "productId"),
		rating: Number(requiredNonEmptyField(formData, "rating")),
		title: requiredField(formData, "title"),
		body: requiredField(formData, "body"),
	};
}
