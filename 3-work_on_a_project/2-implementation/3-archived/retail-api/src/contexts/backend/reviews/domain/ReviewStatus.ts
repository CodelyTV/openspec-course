import { parseLiteral } from "@/contexts/shared/domain/parseLiteral";

export const reviewStatuses = ["pending", "approved", "rejected"] as const;

export type ReviewStatus = (typeof reviewStatuses)[number];

export function parseReviewStatus(value: string): ReviewStatus {
	return parseLiteral("review status", reviewStatuses, value);
}
