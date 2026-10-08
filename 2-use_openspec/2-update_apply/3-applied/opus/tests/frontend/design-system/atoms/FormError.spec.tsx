import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { FormError } from "@/contexts/frontend/design-system/atoms/FormError";

describe("FormError should", () => {
	it("alert the user with the error message", () => {
		render(<FormError message="There isn't enough stock left." />);

		expect(screen.getByRole("alert")).toHaveTextContent(
			"There isn't enough stock left.",
		);
	});

	it("show nothing when there is no error", () => {
		render(<FormError message={null} />);

		expect(screen.queryByRole("alert")).not.toBeInTheDocument();
	});
});
