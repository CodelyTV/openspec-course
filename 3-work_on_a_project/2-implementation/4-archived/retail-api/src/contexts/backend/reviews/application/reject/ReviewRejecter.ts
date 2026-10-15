import type { ReviewRepository } from "../../domain/ReviewRepository";
import { findReviewToModerate } from "../findReviewToModerate";

export class ReviewRejecter {
	constructor(private readonly repository: ReviewRepository) {}

	async reject(id: string): Promise<void> {
		const review = await findReviewToModerate(this.repository, id);

		await this.repository.save(review.reject());
	}
}
