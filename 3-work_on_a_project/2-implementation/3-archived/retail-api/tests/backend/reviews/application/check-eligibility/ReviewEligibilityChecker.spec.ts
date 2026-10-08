import { beforeEach, describe, expect, it } from "vitest";

import { ReviewEligibilityChecker } from "@/contexts/backend/reviews/application/check-eligibility/ReviewEligibilityChecker";
import type { PurchaseHistory } from "@/contexts/backend/reviews/domain/PurchaseHistory";
import type { ReviewRepository } from "@/contexts/backend/reviews/domain/ReviewRepository";
import type { CurrentUserProvider } from "@/contexts/shared/domain/CurrentUserProvider";
import { ProductId } from "@/contexts/shared/domain/ProductId";
import { UserId } from "@/contexts/shared/domain/UserId";

import { Mock } from "../../../../shared/Mock";
import { ReviewMother } from "../../domain/ReviewMother";

describe("ReviewEligibilityChecker should", () => {
	const repository = Mock.create<ReviewRepository>();
	const purchaseHistory = Mock.create<PurchaseHistory>();
	const currentUserProvider = Mock.create<CurrentUserProvider>();
	const checker = new ReviewEligibilityChecker(
		repository,
		purchaseHistory,
		currentUserProvider,
	);
	const customerId = new UserId("user-ana");

	beforeEach(() => {
		currentUserProvider.currentUserIdShouldReturn(customerId);
		repository.searchByUserAndProductShouldReturn(null);
		purchaseHistory.purchasedProductShouldReturn(null);
	});

	it("let a customer who bought the product and has not reviewed it review it", async () => {
		purchaseHistory.purchasedProductShouldReturn({
			productId: "pure-function-tee",
			productName: "Pure Function Tee",
		});

		expect(await checker.check("pure-function-tee")).toEqual({
			status: "can-review",
		});
		purchaseHistory.expectPurchasedProductToHaveBeenCalledWith(
			customerId,
			new ProductId("pure-function-tee"),
		);
	});

	it("not let a customer who did not buy the product review it", async () => {
		expect(await checker.check("pure-function-tee")).toEqual({
			status: "not-purchased",
		});
	});

	it("tell a customer whose review is pending that it awaits moderation", async () => {
		repository.searchByUserAndProductShouldReturn(
			ReviewMother.pending({ userId: customerId.value }),
		);

		expect(await checker.check("pure-function-tee")).toEqual({
			status: "awaiting-moderation",
		});
		repository.expectSearchByUserAndProductToHaveBeenCalledWith(
			customerId,
			new ProductId("pure-function-tee"),
		);
	});

	it.each([
		["approved", ReviewMother.approved],
		["rejected", ReviewMother.rejected],
	])(
		"tell a customer whose review was %s that they already reviewed the product",
		async (_status, moderatedReview) => {
			repository.searchByUserAndProductShouldReturn(
				moderatedReview({ userId: customerId.value }),
			);

			expect(await checker.check("pure-function-tee")).toEqual({
				status: "already-reviewed",
			});
		},
	);
});
