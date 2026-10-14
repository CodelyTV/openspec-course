import type { ReviewerDirectory } from "../../domain/ReviewerDirectory";
import type { ReviewRepository } from "../../domain/ReviewRepository";

export type PendingReviewResponse = {
	id: string;
	productId: string;
	productName: string;
	authorName: string;
	rating: number;
	title: string;
	body: string;
	createdAt: string;
};

export class PendingReviewsLister {
	constructor(
		private readonly repository: ReviewRepository,
		private readonly reviewerDirectory: ReviewerDirectory,
	) {}

	async list(): Promise<PendingReviewResponse[]> {
		const pendingReviews = await this.repository.searchPending();
		const reviewerNames = await this.reviewerDirectory.namesOf(
			pendingReviews.map((review) => review.authorId),
		);

		return pendingReviews.map((review) => ({
			id: review.id.value,
			productId: review.productId.value,
			productName: review.productName,
			authorName: reviewerNames.nameOf(review.authorId),
			rating: review.rating.value,
			title: review.title,
			body: review.body,
			createdAt: review.createdAt.toISOString(),
		}));
	}
}
