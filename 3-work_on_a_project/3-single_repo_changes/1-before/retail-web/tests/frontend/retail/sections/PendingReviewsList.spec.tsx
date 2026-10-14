import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { PendingReviewsList } from "@/contexts/frontend/retail/sections/PendingReviewsList";

import { PendingReviewResponseMother } from "../responses/PendingReviewResponseMother";

describe("PendingReviewsList should", () => {
	it("show each pending review in the order received with its product, author, date, rating, title and body", () => {
		render(
			<PendingReviewsList
				reviews={[
					PendingReviewResponseMother.create({
						productId: "aggregate-hoodie",
						productName: "Aggregate Hoodie",
						authorName: "Ada Lovelace",
						createdAt: "2026-10-01T10:00:00.000Z",
						rating: 4,
						title: "Cozy",
						body: "Great for winter.",
					}),
					PendingReviewResponseMother.create({ title: "Shrank" }),
				]}
			/>,
		);

		const cards = screen.getAllByRole("article");
		const first = cards[0];

		expect(cards.map((card) => card.getAttribute("aria-label"))).toEqual([
			"Cozy",
			"Shrank",
		]);
		expect(
			within(first).getByRole("link", { name: "Aggregate Hoodie" }),
		).toHaveAttribute("href", "/products/aggregate-hoodie");
		expect(first).toHaveTextContent("Ada Lovelace");
		expect(first).toHaveTextContent("1 October 2026");
		expect(
			within(first).getByRole("img", { name: "4 out of 5 stars" }),
		).toBeInTheDocument();
		expect(
			within(first).getByRole("heading", { name: "Cozy" }),
		).toBeInTheDocument();
		expect(first).toHaveTextContent("Great for winter.");
	});

	it("show the actions given for each review", () => {
		const review = PendingReviewResponseMother.create();

		render(
			<PendingReviewsList
				reviews={[review]}
				actionsFor={(pending) => <button>Moderate {pending.id}</button>}
			/>,
		);

		expect(
			screen.getByRole("button", { name: `Moderate ${review.id}` }),
		).toBeInTheDocument();
	});

	it("say there are no reviews awaiting moderation", () => {
		render(<PendingReviewsList reviews={[]} />);

		expect(
			screen.getByText("No reviews awaiting moderation."),
		).toBeInTheDocument();
		expect(screen.queryByRole("article")).not.toBeInTheDocument();
	});
});
