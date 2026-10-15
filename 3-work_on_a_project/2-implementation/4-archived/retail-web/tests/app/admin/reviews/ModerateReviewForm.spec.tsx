import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

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
		approve.mockResolvedValue({ error: null });
		render(<ModerateReviewForm reviewId="review-1" />);

		await user.click(screen.getByRole("button", { name: "Approve" }));

		expect(approve.mock.lastCall?.[1].get("reviewId")).toBe("review-1");
		expect(reject).not.toHaveBeenCalled();
	});

	it("reject the review", async () => {
		const user = userEvent.setup();
		reject.mockResolvedValue({ error: null });
		render(<ModerateReviewForm reviewId="review-1" />);

		await user.click(screen.getByRole("button", { name: "Reject" }));

		expect(reject.mock.lastCall?.[1].get("reviewId")).toBe("review-1");
		expect(approve).not.toHaveBeenCalled();
	});

	it("show why the review could not be moderated", async () => {
		const user = userEvent.setup();
		approve.mockResolvedValue({
			error: "This review was already moderated. Reload the page to see the current queue.",
		});
		render(<ModerateReviewForm reviewId="review-1" />);

		await user.click(screen.getByRole("button", { name: "Approve" }));

		expect(await screen.findByRole("alert")).toHaveTextContent(
			"This review was already moderated.",
		);
	});

	it("disable both buttons while the review is being moderated", async () => {
		const user = userEvent.setup();
		reject.mockReturnValue(new Promise(() => {}));
		render(<ModerateReviewForm reviewId="review-1" />);

		await user.click(screen.getByRole("button", { name: "Reject" }));

		expect(
			await screen.findByRole("button", { name: "Reject", busy: true }),
		).toBeDisabled();
		expect(screen.getByRole("button", { name: "Approve" })).toBeDisabled();
	});
});
