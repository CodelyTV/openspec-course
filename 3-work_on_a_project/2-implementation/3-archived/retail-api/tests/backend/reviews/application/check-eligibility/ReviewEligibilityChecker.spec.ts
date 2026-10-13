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
	const userId = new UserId("user-aibuilder");

	beforeEach(() => {
		currentUserProvider.currentUserIdShouldReturn(userId);
		purchaseHistory.hasBoughtShouldReturn(true);
		repository.searchByProductAndAuthorShouldReturn(null);
	});

	it("say the current customer did not buy the product", async () => {
		purchaseHistory.hasBoughtShouldReturn(false);

		expect(await checker.check("hoodie")).toEqual({
			status: "not-purchased",
		});
		purchaseHistory.expectHasBoughtToHaveBeenCalledWith(
			userId,
			new ProductId("hoodie"),
		);
	});

	it("let the current customer review a product they bought and never reviewed", async () => {
		expect(await checker.check("hoodie")).toEqual({ status: "can-review" });
		repository.expectSearchByProductAndAuthorToHaveBeenCalledWith(
			new ProductId("hoodie"),
			userId,
		);
	});

	it("say the review of the current customer is awaiting moderation", async () => {
		repository.searchByProductAndAuthorShouldReturn(
			ReviewMother.pending({ authorId: userId.value }),
		);

		expect(await checker.check("hoodie")).toEqual({
			status: "pending-review",
		});
	});

	it.each([
		["approved", ReviewMother.approved],
		["rejected", ReviewMother.rejected],
	])(
		"say the current customer already reviewed the product when their review was %s",
		async (_status, moderatedReview) => {
			repository.searchByProductAndAuthorShouldReturn(
				moderatedReview({ authorId: userId.value }),
			);

			expect(await checker.check("hoodie")).toEqual({
				status: "already-reviewed",
			});
		},
	);
});
