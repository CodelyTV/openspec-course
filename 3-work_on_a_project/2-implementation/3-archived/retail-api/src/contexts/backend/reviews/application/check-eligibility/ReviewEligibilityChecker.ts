import type { CurrentUserProvider } from "@/contexts/shared/domain/CurrentUserProvider";
import { ProductId } from "@/contexts/shared/domain/ProductId";

import type { PurchaseHistory } from "../../domain/PurchaseHistory";
import type { Review } from "../../domain/Review";
import type { ReviewRepository } from "../../domain/ReviewRepository";

export type ReviewEligibilityStatus =
	"can-review" | "not-purchased" | "awaiting-moderation" | "already-reviewed";

export type ReviewEligibilityResponse = { status: ReviewEligibilityStatus };

function statusOfExisting(review: Review): ReviewEligibilityStatus {
	return review.isPending() ? "awaiting-moderation" : "already-reviewed";
}

export class ReviewEligibilityChecker {
	constructor(
		private readonly repository: ReviewRepository,
		private readonly purchaseHistory: PurchaseHistory,
		private readonly currentUserProvider: CurrentUserProvider,
	) {}

	async check(productId: string): Promise<ReviewEligibilityResponse> {
		const userId = await this.currentUserProvider.currentUserId();
		const product = new ProductId(productId);

		const existingReview = await this.repository.searchByUserAndProduct(
			userId,
			product,
		);

		if (existingReview) {
			return { status: statusOfExisting(existingReview) };
		}

		const purchasedProduct = await this.purchaseHistory.purchasedProduct(
			userId,
			product,
		);

		return { status: purchasedProduct ? "can-review" : "not-purchased" };
	}
}
