import type { Review } from "../domain/Review";

export type ReviewResponse = {
	id: string;
	authorName: string;
	rating: number;
	title: string;
	body: string;
	createdAt: string;
};

export function toReviewResponse(review: Review): ReviewResponse {
	return {
		id: review.id.value,
		authorName: review.authorName,
		rating: review.rating,
		title: review.title,
		body: review.body,
		createdAt: review.createdAt.toISOString(),
	};
}
