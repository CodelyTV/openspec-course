import type { Clock } from "@/contexts/shared/domain/Clock";
import type { CurrentUserProvider } from "@/contexts/shared/domain/CurrentUserProvider";
import type { IdGenerator } from "@/contexts/shared/domain/IdGenerator";
import { ProductId } from "@/contexts/shared/domain/ProductId";

import { ProductNotPurchasedError } from "../../domain/errors/ProductNotPurchasedError";
import { ReviewAlreadyExistsError } from "../../domain/errors/ReviewAlreadyExistsError";
import type { PurchaseHistory } from "../../domain/PurchaseHistory";
import { Review } from "../../domain/Review";
import type { ReviewAuthors } from "../../domain/ReviewAuthors";
import { ReviewId } from "../../domain/ReviewId";
import type { ReviewRepository } from "../../domain/ReviewRepository";

export type SubmitReviewRequest = {
	productId: string;
	rating: number;
	title: string;
	body: string;
};

export class ReviewSubmitter {
	constructor(
		private readonly repository: ReviewRepository,
		private readonly purchaseHistory: PurchaseHistory,
		private readonly reviewAuthors: ReviewAuthors,
		private readonly currentUserProvider: CurrentUserProvider,
		private readonly idGenerator: IdGenerator,
		private readonly clock: Clock,
	) {}

	async submit(request: SubmitReviewRequest): Promise<void> {
		const userId = await this.currentUserProvider.currentUserId();
		const productId = new ProductId(request.productId);

		const purchasedProduct = await this.purchaseHistory.purchasedProduct(
			userId,
			productId,
		);

		if (!purchasedProduct) {
			throw new ProductNotPurchasedError(productId.value);
		}

		const existingReview = await this.repository.searchByUserAndProduct(
			userId,
			productId,
		);

		if (existingReview) {
			throw new ReviewAlreadyExistsError(productId.value);
		}

		const review = Review.submit(
			new ReviewId(this.idGenerator.generate()),
			{
				productId,
				userId,
				productName: purchasedProduct.productName,
				authorName: await this.reviewAuthors.nameOf(userId),
				rating: request.rating,
				title: request.title,
				body: request.body,
			},
			this.clock.now(),
		);

		await this.repository.save(review);
	}
}
