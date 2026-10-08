import type { Review } from "../../domain/Review";
import type { ReviewRepository } from "../../domain/ReviewRepository";
import { type ReviewResponse, toReviewResponse } from "../ReviewResponse";

export type PendingReviewResponse = ReviewResponse & {
	productId: string;
	productName: string;
};

function toPendingReviewResponse(review: Review): PendingReviewResponse {
	return {
		...toReviewResponse(review),
		productId: review.productId.value,
		productName: review.productName,
	};
}

export class PendingReviewsLister {
	constructor(private readonly repository: ReviewRepository) {}

	async list(): Promise<PendingReviewResponse[]> {
		const pendingReviews = await this.repository.searchPending();

		return pendingReviews.map(toPendingReviewResponse);
	}
}
