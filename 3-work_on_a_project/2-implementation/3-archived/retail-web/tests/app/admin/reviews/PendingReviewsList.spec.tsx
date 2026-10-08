import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { PendingReviewsList } from "@/app/admin/reviews/PendingReviewsList";

import { PendingReviewResponseMother } from "../../../frontend/retail/responses/PendingReviewResponseMother";

vi.mock("@/app/actions/reviews/approveReview", () => ({
	approveReview: vi.fn(),
}));
vi.mock("@/app/actions/reviews/rejectReview", () => ({
	rejectReview: vi.fn(),
}));

describe("PendingReviewsList should", () => {
	it("list the pending reviews in the given order with their product, author, date, rating, title and body", () => {
		render(
			<PendingReviewsList
				reviews={[
					PendingReviewResponseMother.create({
						productName: "Pure Function Tee",
						authorName: "Ana López",
						createdAt: "2026-09-27T10:00:00.000Z",
						rating: 5,
						title: "Fits great",
						body: "Soft cotton.",
					}),
					PendingReviewResponseMother.create({ title: "Runs large" }),
				]}
			/>,
		);

		const reviews = within(
			screen.getByRole("list", { name: "Pending reviews" }),
		).getAllByRole("article");

		expect(
			reviews.map((review) => review.getAttribute("aria-label")),
		).toEqual(["Fits great", "Runs large"]);
		expect(reviews[0]).toHaveTextContent("Pure Function Tee");
		expect(reviews[0]).toHaveTextContent("Soft cotton.");
		expect(reviews[0]).toHaveTextContent("Ana López · 27 September 2026");
		expect(
			within(reviews[0]).getByRole("img", { name: "5 out of 5 stars" }),
		).toBeInTheDocument();
		expect(
			within(reviews[0]).getByRole("button", { name: "Approve" }),
		).toBeInTheDocument();
		expect(
			within(reviews[0]).getByRole("button", { name: "Reject" }),
		).toBeInTheDocument();
	});

	it("say there is nothing to moderate when there are no pending reviews", () => {
		render(<PendingReviewsList reviews={[]} />);

		expect(screen.getByText("No reviews to moderate")).toBeInTheDocument();
		expect(screen.queryByRole("list")).not.toBeInTheDocument();
	});
});
