import { describe, expect, it, vi } from "vitest";

import { GET } from "@/app/me/products/[id]/review-eligibility/route";
import type {
	ReviewEligibilityChecker,
	ReviewEligibilityStatus,
} from "@/contexts/backend/reviews/application/check-eligibility/ReviewEligibilityChecker";

import { Mock } from "../../../../../shared/Mock";

const reviewEligibilityChecker = Mock.create<ReviewEligibilityChecker>();

vi.mock("@/contexts/backend/shared/infrastructure/RetailContainer", () => ({
	retailContainer: {
		get reviewEligibilityChecker(): ReviewEligibilityChecker {
			return reviewEligibilityChecker;
		},
	},
}));

async function getReviewEligibility(id: string): Promise<Response> {
	return GET(
		new Request(`http://localhost/me/products/${id}/review-eligibility`),
		{ params: Promise.resolve({ id }) },
	);
}

describe("GET /me/products/{id}/review-eligibility should", () => {
	it.each<ReviewEligibilityStatus>([
		"can-review",
		"not-purchased",
		"awaiting-moderation",
		"already-reviewed",
	])("respond with the %s status of the current user", async (status) => {
		reviewEligibilityChecker.checkShouldReturn({ status });

		const response = await getReviewEligibility("pure-function-tee");

		expect(response.status).toBe(200);
		expect(await response.json()).toEqual({ status });
		reviewEligibilityChecker.expectCheckToHaveBeenCalledWith(
			"pure-function-tee",
		);
	});
});
