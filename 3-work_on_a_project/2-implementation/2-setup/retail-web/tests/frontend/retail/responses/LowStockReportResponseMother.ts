import type { LowStockReportResponse } from "@/contexts/frontend/retail/api/responses";

const lowStockThreshold = 2;

export class LowStockReportResponseMother {
	static create(
		overrides: Partial<LowStockReportResponse> = {},
	): LowStockReportResponse {
		return {
			threshold: lowStockThreshold,
			variants: [],
			...overrides,
		};
	}
}
