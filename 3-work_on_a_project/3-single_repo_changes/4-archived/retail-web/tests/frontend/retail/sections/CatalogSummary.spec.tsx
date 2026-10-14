import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CatalogSummary } from "@/contexts/frontend/retail/sections/CatalogSummary";

import { ProductResponseMother } from "../responses/ProductResponseMother";
import { ProductVariantResponseMother } from "../responses/ProductVariantResponseMother";

describe("CatalogSummary should", () => {
	it("count the products and the units ready to ship", () => {
		render(
			<CatalogSummary
				products={[
					ProductResponseMother.create({
						variants: [
							ProductVariantResponseMother.create({
								onlineStock: 3,
							}),
							ProductVariantResponseMother.create({
								onlineStock: 0,
							}),
						],
					}),
					ProductResponseMother.create({
						variants: [
							ProductVariantResponseMother.create({
								onlineStock: 4,
							}),
						],
					}),
				]}
			/>,
		);

		expect(screen.getByText("2 products")).toBeInTheDocument();
		expect(screen.getByText("7 units ready to ship.")).toBeInTheDocument();
	});

	it("show an empty catalog", () => {
		render(<CatalogSummary products={[]} />);

		expect(screen.getByText("0 products")).toBeInTheDocument();
		expect(screen.getByText("0 units ready to ship.")).toBeInTheDocument();
	});
});
