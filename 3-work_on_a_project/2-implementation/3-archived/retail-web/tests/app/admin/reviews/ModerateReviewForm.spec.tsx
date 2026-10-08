import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { initialActionState } from "@/app/actions/ActionState";
import { approveReview } from "@/app/actions/reviews/approveReview";
import { rejectReview } from "@/app/actions/reviews/rejectReview";
import { ModerateReviewForm } from "@/app/admin/reviews/ModerateReviewForm";

vi.mock("@/app/actions/reviews/approveReview", () => ({
	approveReview: vi.fn(),
}));
vi.mock("@/app/actions/reviews/rejectReview", () => ({
	rejectReview: vi.fn(),
}));

const approve = vi.mocked(approveReview);
const reject = vi.mocked(rejectReview);

describe("ModerateReviewForm should", () => {
	it("approve the review", async () => {
		const user = userEvent.setup();
		approve.mockResolvedValue(initialActionState);
		render(<ModerateReviewForm reviewId="review-1" />);

		await user.click(screen.getByRole("button", { name: "Approve" }));

		expect(approve.mock.lastCall?.[1].get("id")).toBe("review-1");
		expect(reject).not.toHaveBeenCalled();
	});

	it("reject the review", async () => {
		const user = userEvent.setup();
		reject.mockResolvedValue(initialActionState);
		render(<ModerateReviewForm reviewId="review-1" />);

		await user.click(screen.getByRole("button", { name: "Reject" }));

		expect(reject.mock.lastCall?.[1].get("id")).toBe("review-1");
		expect(approve).not.toHaveBeenCalled();
	});

	it("show why the review could not be moderated", async () => {
		const user = userEvent.setup();
		reject.mockResolvedValue({
			error: "This review was already moderated.",
		});
		render(<ModerateReviewForm reviewId="review-1" />);

		await user.click(screen.getByRole("button", { name: "Reject" }));

		expect(await screen.findByRole("alert")).toHaveTextContent(
			"This review was already moderated.",
		);
	});
});
