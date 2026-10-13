import { beforeEach, describe, expect, it, vi } from "vitest";

import { ReviewSubmitter } from "@/contexts/backend/reviews/application/submit/ReviewSubmitter";
import { InvalidReviewBodyError } from "@/contexts/backend/reviews/domain/errors/InvalidReviewBodyError";
import { InvalidReviewRatingError } from "@/contexts/backend/reviews/domain/errors/InvalidReviewRatingError";
import { InvalidReviewTitleError } from "@/contexts/backend/reviews/domain/errors/InvalidReviewTitleError";
import { ProductNotPurchasedError } from "@/contexts/backend/reviews/domain/errors/ProductNotPurchasedError";
import { ReviewAlreadyExistsError } from "@/contexts/backend/reviews/domain/errors/ReviewAlreadyExistsError";
import { ReviewedProductNotFoundError } from "@/contexts/backend/reviews/domain/errors/ReviewedProductNotFoundError";
import type { PurchaseHistory } from "@/contexts/backend/reviews/domain/PurchaseHistory";
import type {
	Review,
	ReviewPrimitives,
} from "@/contexts/backend/reviews/domain/Review";
import type { ReviewedProducts } from "@/contexts/backend/reviews/domain/ReviewedProducts";
import type { ReviewRepository } from "@/contexts/backend/reviews/domain/ReviewRepository";
import type { Clock } from "@/contexts/shared/domain/Clock";
import type { CurrentUserProvider } from "@/contexts/shared/domain/CurrentUserProvider";
import type { IdGenerator } from "@/contexts/shared/domain/IdGenerator";
import { ProductId } from "@/contexts/shared/domain/ProductId";
import { UserId } from "@/contexts/shared/domain/UserId";

import { Mock } from "../../../../shared/Mock";
import { ReviewMother } from "../../domain/ReviewMother";

describe("ReviewSubmitter should", () => {
	const repository = Mock.create<ReviewRepository>();
	const purchaseHistory = Mock.create<PurchaseHistory>();
	const reviewedProducts = Mock.create<ReviewedProducts>();
	const currentUserProvider = Mock.create<CurrentUserProvider>();
	const idGenerator = Mock.create<IdGenerator>();
	const clock = Mock.create<Clock>();
	const submitter = new ReviewSubmitter(
		repository,
		purchaseHistory,
		reviewedProducts,
		currentUserProvider,
		idGenerator,
		clock,
	);

	const authorId = new UserId("user-aibuilder");
	const newReviewId = "4f1c8e2a-9b3d-4a6e-8c7f-1d2e3b4a5c6d";
	const now = "2026-10-13T09:00:00.000Z";
	const validBody = "Thick fabric and a relaxed fit, perfect for cold days.";

	function expectedPendingReview(
		overrides: Partial<ReviewPrimitives>,
	): Review {
		return ReviewMother.pending({
			id: newReviewId,
			productId: "hoodie-refactor",
			authorId: authorId.value,
			productName: "Hoodie Refactor",
			createdAt: now,
			...overrides,
		});
	}

	beforeEach(() => {
		currentUserProvider.currentUserIdShouldReturn(authorId);
		idGenerator.generateShouldReturn(newReviewId);
		clock.nowShouldReturn(new Date(now));
		reviewedProducts.nameOfShouldReturn("Hoodie Refactor");
		purchaseHistory.hasBoughtShouldReturn(true);
		repository.searchByProductAndAuthorShouldReturn(null);
	});

	describe("for the review content", () => {
		it("save a valid review of a bought product with its values", async () => {
			await submitter.submit(
				"hoodie-refactor",
				4,
				"Warm and comfy",
				validBody,
			);

			repository.expectSaveToHaveBeenCalledWith(
				expectedPendingReview({
					rating: 4,
					title: "Warm and comfy",
					body: validBody,
				}),
			);
		});

		it("save the title and body without surrounding blanks", async () => {
			await submitter.submit(
				"hoodie-refactor",
				5,
				"  Warm and comfy ",
				`\n${validBody}  `,
			);

			repository.expectSaveToHaveBeenCalledWith(
				expectedPendingReview({
					rating: 5,
					title: "Warm and comfy",
					body: validBody,
				}),
			);
		});

		it("accept a title of 100 characters and a body of 2000 characters", async () => {
			const title = "t".repeat(100);
			const body = "b".repeat(2000);

			await submitter.submit("hoodie-refactor", 3, title, body);

			repository.expectSaveToHaveBeenCalledWith(
				expectedPendingReview({ rating: 3, title, body }),
			);
		});

		it.each([0, 6, 3.5])("reject a rating of %j stars", async (rating) => {
			await expect(
				submitter.submit(
					"hoodie-refactor",
					rating,
					"Warm and comfy",
					validBody,
				),
			).rejects.toThrow(
				new InvalidReviewRatingError(rating, 1, 5).message,
			);
			repository.expectSaveNotToHaveBeenCalled();
		});

		it.each(["", "   "])("reject a blank title (%j)", async (title) => {
			await expect(
				submitter.submit("hoodie-refactor", 4, title, validBody),
			).rejects.toBeInstanceOf(InvalidReviewTitleError);
			repository.expectSaveNotToHaveBeenCalled();
		});

		it.each(["", "   "])("reject a blank body (%j)", async (body) => {
			await expect(
				submitter.submit("hoodie-refactor", 4, "Warm and comfy", body),
			).rejects.toBeInstanceOf(InvalidReviewBodyError);
			repository.expectSaveNotToHaveBeenCalled();
		});

		it("reject a title longer than 100 characters, naming the field and its limit", async () => {
			await expect(
				submitter.submit(
					"hoodie-refactor",
					4,
					"t".repeat(101),
					validBody,
				),
			).rejects.toThrow(
				"A review needs a non-blank title of at most 100 characters",
			);
			repository.expectSaveNotToHaveBeenCalled();
		});

		it("reject a body longer than 2000 characters, naming the field and its limit", async () => {
			await expect(
				submitter.submit(
					"hoodie-refactor",
					4,
					"Warm and comfy",
					"b".repeat(2001),
				),
			).rejects.toThrow(
				"A review needs a non-blank text of at most 2000 characters",
			);
			repository.expectSaveNotToHaveBeenCalled();
		});
	});

	describe("for who can review", () => {
		it("reject a review from a customer who did not buy the product", async () => {
			purchaseHistory.hasBoughtShouldReturn(false);

			await expect(
				submitter.submit(
					"hoodie-refactor",
					4,
					"Warm and comfy",
					validBody,
				),
			).rejects.toBeInstanceOf(ProductNotPurchasedError);
			purchaseHistory.expectHasBoughtToHaveBeenCalledWith(
				authorId,
				new ProductId("hoodie-refactor"),
			);
			repository.expectSaveNotToHaveBeenCalled();
		});

		it("reject a review of a product that is no longer in the catalog", async () => {
			reviewedProducts.nameOfShouldReturn(null);

			await expect(
				submitter.submit("ghost", 4, "Warm and comfy", validBody),
			).rejects.toBeInstanceOf(ReviewedProductNotFoundError);
			repository.expectSaveNotToHaveBeenCalled();
		});
	});

	describe("for one review per customer and product", () => {
		it.each([
			["pending", ReviewMother.pending],
			["approved", ReviewMother.approved],
			["rejected", ReviewMother.rejected],
		])(
			"reject a second review when the previous one is %s",
			async (_status, previousReview) => {
				repository.searchByProductAndAuthorShouldReturn(
					previousReview({
						productId: "hoodie-refactor",
						authorId: authorId.value,
					}),
				);

				await expect(
					submitter.submit(
						"hoodie-refactor",
						4,
						"Warm and comfy",
						validBody,
					),
				).rejects.toBeInstanceOf(ReviewAlreadyExistsError);
				repository.expectSearchByProductAndAuthorToHaveBeenCalledWith(
					new ProductId("hoodie-refactor"),
					authorId,
				);
				repository.expectSaveNotToHaveBeenCalled();
			},
		);

		it("save a review of another product the customer bought", async () => {
			vi.mocked(repository.searchByProductAndAuthor).mockImplementation(
				async (productId) =>
					productId.value === "domain-event-tee"
						? ReviewMother.approved({
								productId: "domain-event-tee",
								authorId: authorId.value,
							})
						: null,
			);

			await submitter.submit(
				"hoodie-refactor",
				4,
				"Warm and comfy",
				validBody,
			);

			repository.expectSaveToHaveBeenCalledWith(
				expectedPendingReview({
					rating: 4,
					title: "Warm and comfy",
					body: validBody,
				}),
			);
		});
	});

	it("save every new review as pending", async () => {
		await submitter.submit(
			"hoodie-refactor",
			4,
			"Warm and comfy",
			validBody,
		);

		expect(vi.mocked(repository.save).mock.calls[0][0].status).toBe(
			"pending",
		);
	});
});
