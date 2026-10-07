import type { ProductRepository } from "../../domain/ProductRepository";
import { lowStockThreshold, type Size } from "../../domain/ProductVariant";

export type LowStockResponse = {
	productName: string;
	color: string;
	size: Size;
	stock: number;
};

export type LowStockReportResponse = {
	threshold: number;
	variants: LowStockResponse[];
};

export class LowStockLister {
	constructor(private readonly repository: ProductRepository) {}

	async list(): Promise<LowStockReportResponse> {
		const products = await this.repository.searchAll();

		const variants = products.flatMap((product) =>
			product.variants
				.filter((variant) => variant.isLowStock())
				.map((variant) => ({
					productName: product.name,
					color: variant.color,
					size: variant.size,
					stock: variant.onlineStock,
				})),
		);

		return {
			threshold: lowStockThreshold,
			variants: variants.sort(
				(a, b) =>
					a.stock - b.stock ||
					a.productName.localeCompare(b.productName),
			),
		};
	}
}
