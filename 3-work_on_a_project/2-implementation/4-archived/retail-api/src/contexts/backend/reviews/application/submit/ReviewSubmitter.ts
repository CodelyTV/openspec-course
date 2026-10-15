import type { Clock } from "@/contexts/shared/domain/Clock";
import type { CurrentUserProvider } from "@/contexts/shared/domain/CurrentUserProvider";
import type { IdGenerator } from "@/contexts/shared/domain/IdGenerator";
import { ProductId } from "@/contexts/shared/domain/ProductId";

import { ProductNotPurchasedError } from "../../domain/errors/ProductNotPurchasedError";
import { ReviewAlreadyExistsError } from "../../domain/errors/ReviewAlreadyExistsError";
import { ReviewedProductNotFoundError } from "../../domain/errors/ReviewedProductNotFoundError";
import type { PurchaseHistory } from "../../domain/PurchaseHistory";
import { Review } from "../../domain/Review";
import type { ReviewedProducts } from "../../domain/ReviewedProducts";
import { ReviewId } from "../../domain/ReviewId";
import { ReviewRating } from "../../domain/ReviewRating";
import type { ReviewRepository } from "../../domain/ReviewRepository";

export class ReviewSubmitter {
	constructor(
		private readonly repository: ReviewRepository,
		private readonly purchaseHistory: PurchaseHistory,
		private readonly reviewedProducts: ReviewedProducts,
		private readonly currentUserProvider: CurrentUserProvider,
		private readonly idGenerator: IdGenerator,
		private readonly clock: Clock,
	) {}

	async submit(
		productId: string,
		rating: number,
		title: string,
		body: string,
	): Promise<void> {
		const authorId = await this.currentUserProvider.currentUserId();
		const product = new ProductId(productId);
		const productName = await this.reviewedProducts.nameOf(product);

		if (productName === null) {
			throw new ReviewedProductNotFoundError(productId);
		}

		const review = Review.create(
			new ReviewId(this.idGenerator.generate()),
			product,
			authorId,
			productName,
			new ReviewRating(rating),
			title,
			body,
			this.clock.now(),
		);

		const hasBoughtTheProduct = await this.purchaseHistory.hasBought(
			authorId,
			product,
		);

		if (!hasBoughtTheProduct) {
			throw new ProductNotPurchasedError(productId);
		}

		const existingReview = await this.repository.searchByProductAndAuthor(
			product,
			authorId,
		);

		if (existingReview !== null) {
			throw new ReviewAlreadyExistsError(productId);
		}

		await this.repository.save(review);
	}
}
