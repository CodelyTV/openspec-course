import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { SubmitButton } from "@/contexts/frontend/design-system/atoms/SubmitButton";

async function actionThatNeverFinishes(): Promise<void> {
	return new Promise(() => {});
}

describe("SubmitButton should", () => {
	it("be ready to submit while the form is idle", () => {
		render(
			<form action={actionThatNeverFinishes}>
				<SubmitButton>Confirm order</SubmitButton>
			</form>,
		);

		expect(
			screen.getByRole("button", { name: "Confirm order" }),
		).toBeEnabled();
	});

	it("be disabled and busy while the form is being submitted", async () => {
		const user = userEvent.setup();
		render(
			<form action={actionThatNeverFinishes}>
				<SubmitButton>Confirm order</SubmitButton>
			</form>,
		);

		await user.click(screen.getByRole("button", { name: "Confirm order" }));

		const button = await screen.findByRole("button", {
			name: "Confirm order",
			busy: true,
		});

		expect(button).toBeDisabled();
	});
});
