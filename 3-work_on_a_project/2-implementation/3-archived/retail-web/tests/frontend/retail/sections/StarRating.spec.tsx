import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { StarRating } from "@/contexts/frontend/retail/sections/StarRating";

describe("StarRating should", () => {
	it.each([
		[4, "4 out of 5 stars"],
		[4.3, "4.3 out of 5 stars"],
	])("describe a rating of %d to assistive technologies", (rating, label) => {
		render(<StarRating rating={rating} />);

		expect(screen.getByRole("img", { name: label })).toBeInTheDocument();
	});
});
