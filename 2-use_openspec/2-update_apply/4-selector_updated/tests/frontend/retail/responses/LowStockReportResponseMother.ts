import type { LowStockReportResponse } from "@/contexts/backend/products/application/low-stock/LowStockLister";
import { lowStockThreshold } from "@/contexts/backend/products/domain/ProductVariant";

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
