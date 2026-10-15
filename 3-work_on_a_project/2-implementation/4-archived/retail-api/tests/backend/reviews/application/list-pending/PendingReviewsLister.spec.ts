import { describe, expect, it } from "vitest";

import { PendingReviewsLister } from "@/contexts/backend/reviews/application/list-pending/PendingReviewsLister";
import {
	type ReviewerDirectory,
	ReviewerNames,
} from "@/contexts/backend/reviews/domain/ReviewerDirectory";
import type { ReviewRepository } from "@/contexts/backend/reviews/domain/ReviewRepository";

import { Mock } from "../../../../shared/Mock";
import { ReviewMother } from "../../domain/ReviewMother";

describe("PendingReviewsLister should", () => {
	const repository = Mock.create<ReviewRepository>();
	const reviewerDirectory = Mock.create<ReviewerDirectory>();
	const lister = new PendingReviewsLister(repository, reviewerDirectory);

	it("list the pending reviews as the repository orders them, with product name, author name, date, rating, title and body", async () => {
		const older = ReviewMother.pending({
			productId: "hoodie",
			productName: "Aggregate Hoodie",
			authorId: "user-ada",
			rating: 4,
			title: "Cozy",
			body: "Great for winter.",
			createdAt: "2026-10-01T10:00:00.000Z",
		});
		const newer = ReviewMother.pending({
			productId: "tee",
			productName: "Domain Event Tee",
			authorId: "user-gone",
			rating: 2,
			title: "Shrank",
			body: "Lost a size after washing.",
			createdAt: "2026-10-03T10:00:00.000Z",
		});
		repository.searchPendingShouldReturn([older, newer]);
		reviewerDirectory.namesOfShouldReturn(
			new ReviewerNames(new Map([["user-ada", "Ada Lovelace"]])),
		);

		expect(await lister.list()).toEqual([
			{
				id: older.id.value,
				productId: "hoodie",
				productName: "Aggregate Hoodie",
				authorName: "Ada Lovelace",
				rating: 4,
				title: "Cozy",
				body: "Great for winter.",
				createdAt: "2026-10-01T10:00:00.000Z",
			},
			{
				id: newer.id.value,
				productId: "tee",
				productName: "Domain Event Tee",
				authorName: "user-gone",
				rating: 2,
				title: "Shrank",
				body: "Lost a size after washing.",
				createdAt: "2026-10-03T10:00:00.000Z",
			},
		]);
	});

	it("list nothing when no review is pending", async () => {
		repository.searchPendingShouldReturn([]);
		reviewerDirectory.namesOfShouldReturn(new ReviewerNames(new Map()));

		expect(await lister.list()).toEqual([]);
	});
});
