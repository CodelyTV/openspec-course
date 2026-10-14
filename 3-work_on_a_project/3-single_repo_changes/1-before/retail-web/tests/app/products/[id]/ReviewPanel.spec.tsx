import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ReviewPanel } from "@/app/products/[id]/ReviewPanel";

vi.mock("@/app/actions/reviews/submitReview", () => ({
	submitReview: vi.fn(),
}));

describe("ReviewPanel should", () => {
	it("show the review form to a customer who bought the product and has not reviewed it", () => {
		render(<ReviewPanel productId="hoodie" eligibility="can-review" />);

		expect(
			screen.getByRole("form", { name: "Write a review" }),
		).toBeInTheDocument();
	});

	it("tell a customer whose review is pending that it is awaiting moderation", () => {
		render(<ReviewPanel productId="hoodie" eligibility="pending-review" />);

		expect(screen.getByRole("status")).toHaveTextContent(
			"Thanks! Your review is awaiting moderation.",
		);
		expect(screen.queryByRole("form")).not.toBeInTheDocument();
	});

	it("tell a customer whose review was moderated that they already reviewed the product", () => {
		render(
			<ReviewPanel productId="hoodie" eligibility="already-reviewed" />,
		);

		expect(screen.getByRole("status")).toHaveTextContent(
			"You have already reviewed this product.",
		);
		expect(screen.queryByRole("form")).not.toBeInTheDocument();
		expect(
			screen.queryByRole("button", { name: /edit|delete/i }),
		).not.toBeInTheDocument();
	});

	it("show nothing to a customer who did not buy the product", () => {
		const { container } = render(
			<ReviewPanel productId="hoodie" eligibility="not-purchased" />,
		);

		expect(container).toBeEmptyDOMElement();
	});
});
