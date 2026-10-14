import type {
	ReviewEligibilityResponse,
	ReviewEligibilityStatus,
} from "@/contexts/frontend/retail/api/responses";

export class ReviewEligibilityResponseMother {
	static create(
		status: ReviewEligibilityStatus = "can-review",
	): ReviewEligibilityResponse {
		return { status };
	}
}
