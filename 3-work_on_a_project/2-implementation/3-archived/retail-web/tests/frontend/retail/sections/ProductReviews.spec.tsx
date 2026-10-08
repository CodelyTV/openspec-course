import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ProductReviews } from "@/contexts/frontend/retail/sections/ProductReviews";

import { ProductReviewsResponseMother } from "../responses/ProductReviewsResponseMother";
import { ReviewResponseMother } from "../responses/ReviewResponseMother";

describe("ProductReviews should", () => {
	it("show every approved review with its rating, title, body, author and date in the given order", () => {
		render(
			<ProductReviews
				productReviews={ProductReviewsResponseMother.create({
					reviews: [
						ReviewResponseMother.create({
							title: "Fits great",
							body: "Soft cotton and a clean drape.",
							rating: 5,
							authorName: "Ana López",
							createdAt: "2026-09-27T10:00:00.000Z",
						}),
						ReviewResponseMother.create({
							title: "Runs large",
							rating: 3,
							authorName: "Bob Martin",
							createdAt: "2026-09-26T10:00:00.000Z",
						}),
					],
				})}
			/>,
		);

		const reviews = within(
			screen.getByRole("list", { name: "Approved reviews" }),
		).getAllByRole("article");

		expect(
			reviews.map((review) => review.getAttribute("aria-label")),
		).toEqual(["Fits great", "Runs large"]);
		expect(
			within(reviews[0]).getByRole("img", { name: "5 out of 5 stars" }),
		).toBeInTheDocument();
		expect(reviews[0]).toHaveTextContent("Soft cotton and a clean drape.");
		expect(reviews[0]).toHaveTextContent("Ana López · 27 September 2026");
	});

	it("show the average rating and the number of approved reviews", () => {
		render(
			<ProductReviews
				productReviews={ProductReviewsResponseMother.create({
					averageRating: 4.3,
					reviewCount: 3,
				})}
			/>,
		);

		expect(screen.getByText("4.3 out of 5")).toBeInTheDocument();
		expect(
			screen.getByRole("img", { name: "4.3 out of 5 stars" }),
		).toBeInTheDocument();
		expect(screen.getByText("3 reviews")).toBeInTheDocument();
	});

	it("say there are no reviews yet and show no average when there are no approved reviews", () => {
		render(
			<ProductReviews
				productReviews={ProductReviewsResponseMother.empty()}
			/>,
		);

		expect(screen.getByText("No reviews yet")).toBeInTheDocument();
		expect(screen.queryByText(/out of 5/)).not.toBeInTheDocument();
		expect(screen.queryByRole("list")).not.toBeInTheDocument();
	});

	it("show what it is given next to the reviews, such as the review form", () => {
		render(
			<ProductReviews
				productReviews={ProductReviewsResponseMother.empty()}
			>
				<p>Review form</p>
			</ProductReviews>,
		);

		expect(
			within(screen.getByRole("region", { name: "Reviews" })).getByText(
				"Review form",
			),
		).toBeInTheDocument();
	});
});
