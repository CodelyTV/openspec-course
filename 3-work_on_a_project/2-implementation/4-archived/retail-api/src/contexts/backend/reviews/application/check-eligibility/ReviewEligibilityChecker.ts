import type { CurrentUserProvider } from "@/contexts/shared/domain/CurrentUserProvider";
import { ProductId } from "@/contexts/shared/domain/ProductId";

import type { PurchaseHistory } from "../../domain/PurchaseHistory";
import type { ReviewRepository } from "../../domain/ReviewRepository";

export type ReviewEligibilityStatus =
	"can-review" | "pending-review" | "already-reviewed" | "not-purchased";

export type ReviewEligibilityResponse = { status: ReviewEligibilityStatus };

export class ReviewEligibilityChecker {
	constructor(
		private readonly repository: ReviewRepository,
		private readonly purchaseHistory: PurchaseHistory,
		private readonly currentUserProvider: CurrentUserProvider,
	) {}

	async check(productId: string): Promise<ReviewEligibilityResponse> {
		const userId = await this.currentUserProvider.currentUserId();
		const product = new ProductId(productId);
		const [hasBoughtTheProduct, review] = await Promise.all([
			this.purchaseHistory.hasBought(userId, product),
			this.repository.searchByProductAndAuthor(product, userId),
		]);

		if (!hasBoughtTheProduct) {
			return { status: "not-purchased" };
		}

		if (review === null) {
			return { status: "can-review" };
		}

		return {
			status: review.isPending() ? "pending-review" : "already-reviewed",
		};
	}
}
