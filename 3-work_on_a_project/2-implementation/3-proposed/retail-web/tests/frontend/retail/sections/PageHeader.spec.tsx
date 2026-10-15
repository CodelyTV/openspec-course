import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { PageHeader } from "@/contexts/frontend/retail/sections/PageHeader";

describe("PageHeader should", () => {
	it("show the title as the main heading with its eyebrow and description", () => {
		render(
			<PageHeader
				eyebrow="Checkout"
				title="Review your order."
				description="Payment is simulated."
			/>,
		);

		expect(
			screen.getByRole("heading", {
				level: 1,
				name: "Review your order.",
			}),
		).toBeInTheDocument();
		expect(screen.getByText("Checkout")).toBeInTheDocument();
		expect(screen.getByText("Payment is simulated.")).toBeInTheDocument();
	});

	it("show the title as the main heading in its compact size", () => {
		render(<PageHeader size="compact" title="Orders" eyebrow="Admin" />);

		expect(
			screen.getByRole("heading", { level: 1, name: "Orders" }),
		).toBeInTheDocument();
		expect(screen.getByText("Admin")).toBeInTheDocument();
	});

	it("show the aside content next to the title", () => {
		render(<PageHeader title="Catalog" aside={<p>12 products</p>} />);

		expect(screen.getByText("12 products")).toBeInTheDocument();
	});
});
