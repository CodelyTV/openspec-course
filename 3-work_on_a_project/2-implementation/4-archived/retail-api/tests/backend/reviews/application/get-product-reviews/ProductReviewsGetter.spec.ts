import { describe, expect, it } from "vitest";

import { ProductReviewsGetter } from "@/contexts/backend/reviews/application/get-product-reviews/ProductReviewsGetter";
import {
	type ReviewerDirectory,
	ReviewerNames,
} from "@/contexts/backend/reviews/domain/ReviewerDirectory";
import type { ReviewRepository } from "@/contexts/backend/reviews/domain/ReviewRepository";
import { ProductId } from "@/contexts/shared/domain/ProductId";
import { UserId } from "@/contexts/shared/domain/UserId";

import { Mock } from "../../../../shared/Mock";
import { ReviewMother } from "../../domain/ReviewMother";

describe("ProductReviewsGetter should", () => {
	const repository = Mock.create<ReviewRepository>();
	const reviewerDirectory = Mock.create<ReviewerDirectory>();
	const getter = new ProductReviewsGetter(repository, reviewerDirectory);

	function givenReviewerNames(names: Record<string, string>): void {
		reviewerDirectory.namesOfShouldReturn(
			new ReviewerNames(new Map(Object.entries(names))),
		);
	}

	it("return the approved reviews of the product as the repository orders them, with their author names", async () => {
		const newer = ReviewMother.approved({
			productId: "hoodie",
			authorId: "user-ada",
			rating: 5,
			title: "Love it",
			body: "Warm and soft.",
			createdAt: "2026-10-05T10:00:00.000Z",
		});
		const older = ReviewMother.approved({
			productId: "hoodie",
			authorId: "user-grace",
			rating: 3,
			title: "Fine",
			body: "A bit loose.",
			createdAt: "2026-10-01T10:00:00.000Z",
		});
		repository.searchApprovedByProductShouldReturn([newer, older]);
		givenReviewerNames({
			"user-ada": "Ada Lovelace",
			"user-grace": "Grace Hopper",
		});

		const response = await getter.get("hoodie");

		expect(response.reviews).toEqual([
			{
				id: newer.id.value,
				rating: 5,
				title: "Love it",
				body: "Warm and soft.",
				authorName: "Ada Lovelace",
				createdAt: "2026-10-05T10:00:00.000Z",
			},
			{
				id: older.id.value,
				rating: 3,
				title: "Fine",
				body: "A bit loose.",
				authorName: "Grace Hopper",
				createdAt: "2026-10-01T10:00:00.000Z",
			},
		]);
		repository.expectSearchApprovedByProductToHaveBeenCalledWith(
			new ProductId("hoodie"),
		);
		reviewerDirectory.expectNamesOfToHaveBeenCalledWith([
			new UserId("user-ada"),
			new UserId("user-grace"),
		]);
	});

	it("summarize the approved reviews with their count and average rating rounded to one decimal", async () => {
		repository.searchApprovedByProductShouldReturn([
			ReviewMother.approved({ rating: 5 }),
			ReviewMother.approved({ rating: 4 }),
			ReviewMother.approved({ rating: 4 }),
		]);
		givenReviewerNames({});

		const response = await getter.get("hoodie");

		expect(response.averageRating).toBe(4.3);
		expect(response.reviewCount).toBe(3);
	});

	it("give no average rating when the product has no approved reviews", async () => {
		repository.searchApprovedByProductShouldReturn([]);
		givenReviewerNames({});

		expect(await getter.get("hoodie")).toEqual({
			averageRating: null,
			reviewCount: 0,
			reviews: [],
		});
	});
});
