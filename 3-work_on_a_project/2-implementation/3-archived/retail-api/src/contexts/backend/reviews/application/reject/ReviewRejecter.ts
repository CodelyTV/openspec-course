import { ReviewNotFoundError } from "../../domain/errors/ReviewNotFoundError";
import { ReviewId } from "../../domain/ReviewId";
import type { ReviewRepository } from "../../domain/ReviewRepository";

export class ReviewRejecter {
	constructor(private readonly repository: ReviewRepository) {}

	async reject(id: string): Promise<void> {
		const review = await this.repository.search(new ReviewId(id));

		if (!review) {
			throw new ReviewNotFoundError(id);
		}

		await this.repository.save(review.reject());
	}
}
