import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Button } from "@/contexts/frontend/design-system/atoms/Button";

describe("Button should", () => {
	it("be enabled by default", () => {
		render(<Button>Save</Button>);

		expect(screen.getByRole("button", { name: "Save" })).toBeEnabled();
	});

	it("be disabled and busy while loading", () => {
		render(<Button isLoading>Save</Button>);

		const button = screen.getByRole("button", { name: "Save" });

		expect(button).toBeDisabled();
		expect(button).toHaveAttribute("aria-busy", "true");
	});

	it("stay disabled when asked to, even when not loading", () => {
		render(<Button disabled>Save</Button>);

		const button = screen.getByRole("button", { name: "Save" });

		expect(button).toBeDisabled();
		expect(button).not.toHaveAttribute("aria-busy");
	});

	it("render as a link when given an href", () => {
		render(<Button href="/">Back to catalog</Button>);

		expect(
			screen.getByRole("link", { name: "Back to catalog" }),
		).toHaveAttribute("href", "/");
	});
});
