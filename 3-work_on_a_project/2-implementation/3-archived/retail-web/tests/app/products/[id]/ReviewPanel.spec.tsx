import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ReviewPanel } from "@/app/products/[id]/ReviewPanel";

import { ReviewEligibilityResponseMother } from "../../../frontend/retail/responses/ReviewEligibilityResponseMother";

vi.mock("@/app/actions/reviews/submitReview", () => ({
	submitReview: vi.fn(),
}));

describe("ReviewPanel should", () => {
	it("show the review form to a customer who bought the product and has not reviewed it", () => {
		render(
			<ReviewPanel
				productId="pure-function-tee"
				eligibility={ReviewEligibilityResponseMother.create(
					"can-review",
				)}
			/>,
		);

		expect(
			screen.getByRole("form", { name: "Write a review" }),
		).toBeInTheDocument();
	});

	it("tell a customer whose review is pending that it awaits moderation, without the form", () => {
		render(
			<ReviewPanel
				productId="pure-function-tee"
				eligibility={ReviewEligibilityResponseMother.create(
					"awaiting-moderation",
				)}
			/>,
		);

		expect(screen.getByRole("status")).toHaveTextContent(
			"Thanks! Your review is awaiting moderation.",
		);
		expect(screen.queryByRole("form")).not.toBeInTheDocument();
	});

	it("tell a customer whose review was moderated that they already reviewed the product, without the form", () => {
		render(
			<ReviewPanel
				productId="pure-function-tee"
				eligibility={ReviewEligibilityResponseMother.create(
					"already-reviewed",
				)}
			/>,
		);

		expect(screen.getByRole("status")).toHaveTextContent(
			"You already reviewed this product.",
		);
		expect(screen.queryByRole("form")).not.toBeInTheDocument();
	});

	it("show nothing to a customer who did not buy the product", () => {
		const { container } = render(
			<ReviewPanel
				productId="pure-function-tee"
				eligibility={ReviewEligibilityResponseMother.create(
					"not-purchased",
				)}
			/>,
		);

		expect(container).toBeEmptyDOMElement();
	});
});
