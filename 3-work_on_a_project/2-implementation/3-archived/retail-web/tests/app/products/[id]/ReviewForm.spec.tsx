import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { submitReview } from "@/app/actions/reviews/submitReview";
import { ReviewForm } from "@/app/products/[id]/ReviewForm";

vi.mock("@/app/actions/reviews/submitReview", () => ({
	submitReview: vi.fn(),
}));

const submit = vi.mocked(submitReview);

type UserEvent = ReturnType<typeof userEvent.setup>;

async function writeReview(user: UserEvent): Promise<void> {
	await user.click(screen.getByRole("radio", { name: "4 stars" }));
	await user.type(
		screen.getByRole("textbox", { name: "Title" }),
		"Warm and comfy",
	);
	await user.type(
		screen.getByRole("textbox", { name: "Review" }),
		"Thick fabric and a relaxed fit.",
	);
	await user.click(screen.getByRole("button", { name: "Submit review" }));
}

function submittedForm(): FormData | undefined {
	return submit.mock.lastCall?.[1];
}

describe("ReviewForm should", () => {
	it("submit the rating, title and body of the review for the product", async () => {
		const user = userEvent.setup();
		submit.mockResolvedValue({ error: null });
		render(<ReviewForm productId="hoodie" />);

		await writeReview(user);

		expect(Object.fromEntries(submittedForm() ?? [])).toEqual({
			productId: "hoodie",
			rating: "4",
			title: "Warm and comfy",
			body: "Thick fabric and a relaxed fit.",
		});
	});

	it("offer a required rating from 1 to 5 stars", () => {
		render(<ReviewForm productId="hoodie" />);

		const ratingGroup = screen.getByRole("group", { name: "Rating" });
		const stars = screen.getAllByRole("radio");

		expect(ratingGroup).toBeInTheDocument();
		expect(stars.map((star) => star.getAttribute("value"))).toEqual([
			"1",
			"2",
			"3",
			"4",
			"5",
		]);
		expect(stars[0]).toBeRequired();
	});

	it("limit the title to 100 characters and the body to 2000", () => {
		render(<ReviewForm productId="hoodie" />);

		expect(screen.getByRole("textbox", { name: "Title" })).toHaveAttribute(
			"maxLength",
			"100",
		);
		expect(screen.getByRole("textbox", { name: "Review" })).toHaveAttribute(
			"maxLength",
			"2000",
		);
	});

	it("show why the review could not be submitted, keeping what was written", async () => {
		const user = userEvent.setup();
		submit.mockResolvedValue({
			error: "You have already reviewed this product.",
		});
		render(<ReviewForm productId="hoodie" />);

		await writeReview(user);

		expect(await screen.findByRole("alert")).toHaveTextContent(
			"You have already reviewed this product.",
		);
		expect(screen.getByRole("textbox", { name: "Title" })).toHaveValue(
			"Warm and comfy",
		);
	});

	it("disable the button while the review is being submitted", async () => {
		const user = userEvent.setup();
		submit.mockReturnValue(new Promise(() => {}));
		render(<ReviewForm productId="hoodie" />);

		await writeReview(user);

		expect(
			await screen.findByRole("button", {
				name: "Submit review",
				busy: true,
			}),
		).toBeDisabled();
	});
});
