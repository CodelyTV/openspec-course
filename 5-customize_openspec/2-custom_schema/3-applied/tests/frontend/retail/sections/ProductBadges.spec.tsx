import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ProductBadges } from "@/contexts/frontend/retail/sections/ProductBadges";

describe("ProductBadges should", () => {
	it("show every badge of the product, including unknown ones", () => {
		render(
			<ProductBadges badges={["New", "Limited edition", "Bestseller"]} />,
		);

		expect(screen.getByText("New")).toBeInTheDocument();
		expect(screen.getByText("Limited edition")).toBeInTheDocument();
		expect(screen.getByText("Bestseller")).toBeInTheDocument();
	});

	it("render nothing when the product has no badges", () => {
		const { container } = render(<ProductBadges badges={[]} />);

		expect(container).toBeEmptyDOMElement();
	});
});
