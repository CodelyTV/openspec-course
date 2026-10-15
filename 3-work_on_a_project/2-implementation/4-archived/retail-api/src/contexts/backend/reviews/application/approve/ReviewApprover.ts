import type { ReviewRepository } from "../../domain/ReviewRepository";
import { findReviewToModerate } from "../findReviewToModerate";

export class ReviewApprover {
	constructor(private readonly repository: ReviewRepository) {}

	async approve(id: string): Promise<void> {
		const review = await findReviewToModerate(this.repository, id);

		await this.repository.save(review.approve());
	}
}
