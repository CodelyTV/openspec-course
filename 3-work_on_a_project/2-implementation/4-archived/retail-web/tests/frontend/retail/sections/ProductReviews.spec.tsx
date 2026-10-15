import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ProductReviews } from "@/contexts/frontend/retail/sections/ProductReviews";

import { ProductReviewResponseMother } from "../responses/ProductReviewResponseMother";
import { ProductReviewsResponseMother } from "../responses/ProductReviewsResponseMother";

describe("ProductReviews should", () => {
	it("summarize the average rating and the number of reviews", () => {
		render(
			<ProductReviews
				productReviews={ProductReviewsResponseMother.create({
					averageRating: 4.3,
					reviewCount: 3,
				})}
			/>,
		);

		const section = screen.getByRole("region", { name: "Reviews" });

		expect(section).toHaveTextContent("4.3 out of 5 · 3 reviews");
	});

	it("show every review in the order received with its rating, title, body, author and date", () => {
		render(
			<ProductReviews
				productReviews={ProductReviewsResponseMother.create({
					reviews: [
						ProductReviewResponseMother.create({
							rating: 4,
							title: "Warm and comfy",
							body: "Thick fabric and a relaxed fit.",
							authorName: "Ada Lovelace",
							createdAt: "2026-10-05T10:00:00.000Z",
						}),
						ProductReviewResponseMother.create({
							title: "Runs small",
						}),
					],
				})}
			/>,
		);

		const reviews = screen.getAllByRole("article");

		expect(
			reviews.map((review) => review.getAttribute("aria-label")),
		).toEqual(["Warm and comfy", "Runs small"]);
		expect(
			within(reviews[0]).getByRole("img", { name: "4 out of 5 stars" }),
		).toBeInTheDocument();
		expect(
			within(reviews[0]).getByRole("heading", { name: "Warm and comfy" }),
		).toBeInTheDocument();
		expect(reviews[0]).toHaveTextContent("Thick fabric and a relaxed fit.");
		expect(reviews[0]).toHaveTextContent("Ada Lovelace · 5 October 2026");
	});

	it("say there are no reviews yet, with no average", () => {
		render(
			<ProductReviews
				productReviews={ProductReviewsResponseMother.empty()}
			/>,
		);

		const section = screen.getByRole("region", { name: "Reviews" });

		expect(section).toHaveTextContent("No reviews yet");
		expect(section).not.toHaveTextContent("out of 5");
		expect(screen.queryByRole("article")).not.toBeInTheDocument();
	});

	it("show what it is given next to the summary", () => {
		render(
			<ProductReviews
				productReviews={ProductReviewsResponseMother.empty()}
			>
				<p>Thanks! Your review is awaiting moderation.</p>
			</ProductReviews>,
		);

		expect(
			screen.getByRole("region", { name: "Reviews" }),
		).toHaveTextContent("Thanks! Your review is awaiting moderation.");
	});
});
