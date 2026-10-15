import { describe, expect, it, vi } from "vitest";

import { GET } from "@/app/me/reviews/eligibility/route";
import type { ReviewEligibilityChecker } from "@/contexts/backend/reviews/application/check-eligibility/ReviewEligibilityChecker";

import { Mock } from "../../../../shared/Mock";

const reviewEligibilityChecker = Mock.create<ReviewEligibilityChecker>();

vi.mock("@/contexts/backend/shared/infrastructure/RetailContainer", () => ({
	retailContainer: {
		get reviewEligibilityChecker(): ReviewEligibilityChecker {
			return reviewEligibilityChecker;
		},
	},
}));

async function getEligibility(query: string): Promise<Response> {
	return GET(
		new Request(`http://localhost/me/reviews/eligibility${query}`),
		undefined,
	);
}

describe("GET /me/reviews/eligibility should", () => {
	it("respond with whether the current customer can review the product", async () => {
		reviewEligibilityChecker.checkShouldReturn({ status: "can-review" });

		const response = await getEligibility("?productId=hoodie");

		expect(response.status).toBe(200);
		expect(await response.json()).toEqual({ status: "can-review" });
		reviewEligibilityChecker.expectCheckToHaveBeenCalledWith("hoodie");
	});

	it.each(["", "?productId=", "?productId=%20"])(
		"respond 400 with an InvalidArgumentError when the productId is missing (%j)",
		async (query) => {
			const response = await getEligibility(query);

			expect(response.status).toBe(400);
			expect((await response.json()).error.type).toBe(
				"InvalidArgumentError",
			);
			reviewEligibilityChecker.expectCheckNotToHaveBeenCalled();
		},
	);
});
