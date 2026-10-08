import { beforeEach, describe, expect, it } from "vitest";

import {
	ReviewSubmitter,
	type SubmitReviewRequest,
} from "@/contexts/backend/reviews/application/submit/ReviewSubmitter";
import { InvalidReviewBodyError } from "@/contexts/backend/reviews/domain/errors/InvalidReviewBodyError";
import { InvalidReviewRatingError } from "@/contexts/backend/reviews/domain/errors/InvalidReviewRatingError";
import { InvalidReviewTitleError } from "@/contexts/backend/reviews/domain/errors/InvalidReviewTitleError";
import { ProductNotPurchasedError } from "@/contexts/backend/reviews/domain/errors/ProductNotPurchasedError";
import { ReviewAlreadyExistsError } from "@/contexts/backend/reviews/domain/errors/ReviewAlreadyExistsError";
import type { PurchaseHistory } from "@/contexts/backend/reviews/domain/PurchaseHistory";
import type { ReviewAuthors } from "@/contexts/backend/reviews/domain/ReviewAuthors";
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
	const reviewAuthors = Mock.create<ReviewAuthors>();
	const currentUserProvider = Mock.create<CurrentUserProvider>();
	const idGenerator = Mock.create<IdGenerator>();
	const clock = Mock.create<Clock>();
	const submitter = new ReviewSubmitter(
		repository,
		purchaseHistory,
		reviewAuthors,
		currentUserProvider,
		idGenerator,
		clock,
	);

	const customerId = "user-ana";
	const newReviewId = "4b8f2c1e-9d3a-4e7b-a6c5-0f1e2d3c4b5a";
	const now = "2026-09-28T12:00:00.000Z";

	function validRequest(
		overrides: Partial<SubmitReviewRequest> = {},
	): SubmitReviewRequest {
		return {
			productId: "pure-function-tee",
			rating: 4,
			title: "Fits great",
			body: "Soft cotton and a clean drape.",
			...overrides,
		};
	}

	function givenThePurchasedProduct(
		productId: string,
		productName: string,
	): void {
		purchaseHistory.purchasedProductShouldReturn({
			productId,
			productName,
		});
	}

	beforeEach(() => {
		currentUserProvider.currentUserIdShouldReturn(new UserId(customerId));
		idGenerator.generateShouldReturn(newReviewId);
		clock.nowShouldReturn(new Date(now));
		reviewAuthors.nameOfShouldReturn("Ana López");
		repository.searchByUserAndProductShouldReturn(null);
		givenThePurchasedProduct("pure-function-tee", "Pure Function Tee");
	});

	it("save a valid review of a bought product as pending, with the product and author names", async () => {
		await submitter.submit(validRequest());

		repository.expectSaveToHaveBeenCalledWith(
			ReviewMother.pending({
				id: newReviewId,
				productId: "pure-function-tee",
				userId: customerId,
				productName: "Pure Function Tee",
				authorName: "Ana López",
				rating: 4,
				title: "Fits great",
				body: "Soft cotton and a clean drape.",
				createdAt: now,
			}),
		);
		purchaseHistory.expectPurchasedProductToHaveBeenCalledWith(
			new UserId(customerId),
			new ProductId("pure-function-tee"),
		);
		reviewAuthors.expectNameOfToHaveBeenCalledWith(new UserId(customerId));
	});

	it("reject a review of a product the customer did not buy", async () => {
		purchaseHistory.purchasedProductShouldReturn(null);

		await expect(submitter.submit(validRequest())).rejects.toBeInstanceOf(
			ProductNotPurchasedError,
		);
		repository.expectSaveNotToHaveBeenCalled();
	});

	it.each([
		["pending", ReviewMother.pending],
		["approved", ReviewMother.approved],
		["rejected", ReviewMother.rejected],
	])(
		"reject a second review of the same product when the first one is %s",
		async (_status, previousReview) => {
			repository.searchByUserAndProductShouldReturn(
				previousReview({
					userId: customerId,
					productId: "pure-function-tee",
				}),
			);

			await expect(
				submitter.submit(validRequest()),
			).rejects.toBeInstanceOf(ReviewAlreadyExistsError);
			repository.expectSearchByUserAndProductToHaveBeenCalledWith(
				new UserId(customerId),
				new ProductId("pure-function-tee"),
			);
			repository.expectSaveNotToHaveBeenCalled();
		},
	);

	it("save a review of another bought product from a customer who already reviewed a different one", async () => {
		givenThePurchasedProduct("hexagonal-overshirt", "Hexagonal Overshirt");

		await submitter.submit(
			validRequest({ productId: "hexagonal-overshirt" }),
		);

		repository.expectSearchByUserAndProductToHaveBeenCalledWith(
			new UserId(customerId),
			new ProductId("hexagonal-overshirt"),
		);
		repository.expectSaveToHaveBeenCalledWith(
			ReviewMother.pending({
				id: newReviewId,
				productId: "hexagonal-overshirt",
				userId: customerId,
				productName: "Hexagonal Overshirt",
				authorName: "Ana López",
				rating: 4,
				title: "Fits great",
				body: "Soft cotton and a clean drape.",
				createdAt: now,
			}),
		);
	});

	it("save the title and body without surrounding blanks", async () => {
		await submitter.submit(
			validRequest({ title: "  Fits great ", body: "\n Soft cotton.  " }),
		);

		repository.expectSaveToHaveBeenCalledWith(
			ReviewMother.pending({
				id: newReviewId,
				productId: "pure-function-tee",
				userId: customerId,
				productName: "Pure Function Tee",
				authorName: "Ana López",
				rating: 4,
				title: "Fits great",
				body: "Soft cotton.",
				createdAt: now,
			}),
		);
	});

	it.each([1, 5])("accept a rating of %d stars", async (rating) => {
		await submitter.submit(validRequest({ rating }));

		repository.expectSaveToHaveBeenCalled();
	});

	it.each([0, 6, 3.5])("reject a rating of %d stars", async (rating) => {
		await expect(
			submitter.submit(validRequest({ rating })),
		).rejects.toBeInstanceOf(InvalidReviewRatingError);
		repository.expectSaveNotToHaveBeenCalled();
	});

	it.each([
		["empty", ""],
		["only spaces", "   "],
		["101 characters long", "a".repeat(101)],
	])("reject a title that is %s", async (_case, title) => {
		await expect(
			submitter.submit(validRequest({ title })),
		).rejects.toBeInstanceOf(InvalidReviewTitleError);
		repository.expectSaveNotToHaveBeenCalled();
	});

	it("accept a title of 100 characters and a body of 2000 characters", async () => {
		await submitter.submit(
			validRequest({ title: "a".repeat(100), body: "b".repeat(2000) }),
		);

		repository.expectSaveToHaveBeenCalled();
	});

	it.each([
		["empty", ""],
		["only spaces", "   "],
		["2001 characters long", "b".repeat(2001)],
	])("reject a body that is %s", async (_case, body) => {
		await expect(
			submitter.submit(validRequest({ body })),
		).rejects.toBeInstanceOf(InvalidReviewBodyError);
		repository.expectSaveNotToHaveBeenCalled();
	});
});
