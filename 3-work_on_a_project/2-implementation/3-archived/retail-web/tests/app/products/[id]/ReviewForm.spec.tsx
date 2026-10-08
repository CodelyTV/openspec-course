import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { initialActionState } from "@/app/actions/ActionState";
import { submitReview } from "@/app/actions/reviews/submitReview";
import { ReviewForm } from "@/app/products/[id]/ReviewForm";

vi.mock("@/app/actions/reviews/submitReview", () => ({
	submitReview: vi.fn(),
}));

const submit = vi.mocked(submitReview);

type User = ReturnType<typeof userEvent.setup>;

async function fillInReview(
	user: User,
	review: { stars: string; title: string; body: string },
): Promise<void> {
	await user.click(screen.getByRole("radio", { name: review.stars }));
	if (review.title.length > 0) {
		await user.type(
			screen.getByRole("textbox", { name: "Title" }),
			review.title,
		);
	}
	await user.type(
		screen.getByRole("textbox", { name: "Review" }),
		review.body,
	);
}

describe("ReviewForm should", () => {
	it("submit the rating, title and body of the review for the product", async () => {
		const user = userEvent.setup();
		submit.mockResolvedValue(initialActionState);
		render(<ReviewForm productId="pure-function-tee" />);

		await fillInReview(user, {
			stars: "4 stars",
			title: "Fits great",
			body: "Soft cotton.",
		});
		await user.click(screen.getByRole("button", { name: "Submit review" }));

		const submitted = submit.mock.lastCall?.[1];
		expect(submitted?.get("productId")).toBe("pure-function-tee");
		expect(submitted?.get("rating")).toBe("4");
		expect(submitted?.get("title")).toBe("Fits great");
		expect(submitted?.get("body")).toBe("Soft cotton.");
	});

	it("show the error and keep what the customer wrote when the review is rejected", async () => {
		const user = userEvent.setup();
		submit.mockResolvedValue({
			error: "The title must have between 1 and 100 characters.",
		});
		render(<ReviewForm productId="pure-function-tee" />);

		await fillInReview(user, {
			stars: "2 stars",
			title: "",
			body: "Too tight.",
		});
		await user.click(screen.getByRole("button", { name: "Submit review" }));

		expect(await screen.findByRole("alert")).toHaveTextContent(
			"The title must have between 1 and 100 characters.",
		);
		expect(screen.getByRole("radio", { name: "2 stars" })).toBeChecked();
		expect(screen.getByRole("textbox", { name: "Review" })).toHaveValue(
			"Too tight.",
		);
	});

	it("disable the submit button while the review is being sent", async () => {
		const user = userEvent.setup();
		submit.mockReturnValue(new Promise(() => {}));
		render(<ReviewForm productId="pure-function-tee" />);

		await fillInReview(user, {
			stars: "5 stars",
			title: "Great",
			body: "Love it.",
		});
		await user.click(screen.getByRole("button", { name: "Submit review" }));

		expect(
			await screen.findByRole("button", {
				name: "Submit review",
				busy: true,
			}),
		).toBeDisabled();
	});
});
