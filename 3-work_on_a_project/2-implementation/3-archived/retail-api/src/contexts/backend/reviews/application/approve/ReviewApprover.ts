import { ReviewNotFoundError } from "../../domain/errors/ReviewNotFoundError";
import { ReviewId } from "../../domain/ReviewId";
import type { ReviewRepository } from "../../domain/ReviewRepository";

export class ReviewApprover {
	constructor(private readonly repository: ReviewRepository) {}

	async approve(id: string): Promise<void> {
		const review = await this.repository.search(new ReviewId(id));

		if (!review) {
			throw new ReviewNotFoundError(id);
		}

		await this.repository.save(review.approve());
	}
}
