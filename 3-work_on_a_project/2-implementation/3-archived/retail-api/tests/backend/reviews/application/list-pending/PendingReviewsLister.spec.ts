import { describe, expect, it } from "vitest";

import { PendingReviewsLister } from "@/contexts/backend/reviews/application/list-pending/PendingReviewsLister";
import type { ReviewRepository } from "@/contexts/backend/reviews/domain/ReviewRepository";

import { Mock } from "../../../../shared/Mock";
import { ReviewMother } from "../../domain/ReviewMother";

describe("PendingReviewsLister should", () => {
	const repository = Mock.create<ReviewRepository>();
	const lister = new PendingReviewsLister(repository);

	it("list the pending reviews oldest first, with their product name, author name, date, rating, title and body", async () => {
		const yesterday = ReviewMother.pending({
			productId: "pure-function-tee",
			productName: "Pure Function Tee",
			authorName: "Ana López",
			rating: 5,
			title: "Fits great",
			body: "Soft cotton.",
			createdAt: "2026-09-27T10:00:00.000Z",
		});
		const today = ReviewMother.pending({
			productId: "hexagonal-overshirt",
			productName: "Hexagonal Overshirt",
			authorName: "Bob Martin",
			rating: 2,
			title: "Too short",
			body: "The sleeves are short for me.",
			createdAt: "2026-09-28T10:00:00.000Z",
		});
		repository.searchPendingShouldReturn([yesterday, today]);

		expect(await lister.list()).toEqual([
			{
				id: yesterday.id.value,
				productId: "pure-function-tee",
				productName: "Pure Function Tee",
				authorName: "Ana López",
				rating: 5,
				title: "Fits great",
				body: "Soft cotton.",
				createdAt: "2026-09-27T10:00:00.000Z",
			},
			{
				id: today.id.value,
				productId: "hexagonal-overshirt",
				productName: "Hexagonal Overshirt",
				authorName: "Bob Martin",
				rating: 2,
				title: "Too short",
				body: "The sleeves are short for me.",
				createdAt: "2026-09-28T10:00:00.000Z",
			},
		]);
	});

	it("list nothing when there are no pending reviews, as moderated reviews are not queued", async () => {
		repository.searchPendingShouldReturn([]);

		expect(await lister.list()).toEqual([]);
	});
});
