import { describe, expect, it } from "vitest";

import { ProductReviewsFinder } from "@/contexts/backend/reviews/application/find-for-product/ProductReviewsFinder";
import { toReviewResponse } from "@/contexts/backend/reviews/application/ReviewResponse";
import type { ReviewRepository } from "@/contexts/backend/reviews/domain/ReviewRepository";
import { ProductId } from "@/contexts/shared/domain/ProductId";

import { Mock } from "../../../../shared/Mock";
import { ReviewMother } from "../../domain/ReviewMother";

describe("ProductReviewsFinder should", () => {
	const repository = Mock.create<ReviewRepository>();
	const finder = new ProductReviewsFinder(repository);

	it("return the approved reviews of the product in the order given by the repository, newest first", async () => {
		const yesterday = ReviewMother.approved({
			productId: "pure-function-tee",
			authorName: "Ana López",
			rating: 5,
			title: "Fits great",
			body: "Soft cotton.",
			createdAt: "2026-09-27T10:00:00.000Z",
		});
		const twoDaysAgo = ReviewMother.approved({
			productId: "pure-function-tee",
			rating: 4,
			createdAt: "2026-09-26T10:00:00.000Z",
		});
		repository.searchApprovedByProductShouldReturn([yesterday, twoDaysAgo]);

		const found = await finder.find("pure-function-tee");

		expect(found.reviews).toEqual([
			{
				id: yesterday.id.value,
				authorName: "Ana López",
				rating: 5,
				title: "Fits great",
				body: "Soft cotton.",
				createdAt: "2026-09-27T10:00:00.000Z",
			},
			toReviewResponse(twoDaysAgo),
		]);
		repository.expectSearchApprovedByProductToHaveBeenCalledWith(
			new ProductId("pure-function-tee"),
		);
	});

	it("average only the approved reviews, rounded to one decimal", async () => {
		repository.searchApprovedByProductShouldReturn([
			ReviewMother.approved({ rating: 5 }),
			ReviewMother.approved({ rating: 4 }),
			ReviewMother.approved({ rating: 4 }),
		]);

		const found = await finder.find("pure-function-tee");

		expect(found.averageRating).toBe(4.3);
		expect(found.reviewCount).toBe(3);
	});

	it("return no average and no reviews when the product has no approved reviews", async () => {
		repository.searchApprovedByProductShouldReturn([]);

		expect(await finder.find("pure-function-tee")).toEqual({
			averageRating: null,
			reviewCount: 0,
			reviews: [],
		});
	});
});
