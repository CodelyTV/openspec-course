import type { OutfitRepository } from "../../domain/OutfitRepository";
import type { ProductRepository } from "../../domain/ProductRepository";
import { type Size, sizeOrder } from "../../domain/ProductVariant";

export type InventoryResponse = {
	productName: string;
	collection: string;
	color: string;
	size: Size;
	stock: number;
	low: boolean;
	inOutfit: boolean;
};

export type InventoryReportResponse = {
	variants: InventoryResponse[];
	lowStockCount: number;
};

export class InventoryLister {
	constructor(
		private readonly repository: ProductRepository,
		private readonly outfitRepository: OutfitRepository,
	) {}

	async list(): Promise<InventoryReportResponse> {
		const products = await this.repository.searchAll();
		const outfitCounts =
			await this.outfitRepository.countOutfitsByProduct();

		const variants = products.flatMap((product) =>
			product.variants.map((variant) => ({
				productName: product.name,
				collection: product.collection,
				color: variant.color,
				size: variant.size,
				stock: variant.onlineStock,
				low: variant.isLowStock(),
				inOutfit: (outfitCounts.get(product.id.value) ?? 0) > 0,
			})),
		);

		return {
			variants: variants.sort(
				(a, b) =>
					a.stock - b.stock ||
					a.productName.localeCompare(b.productName) ||
					sizeOrder.indexOf(a.size) - sizeOrder.indexOf(b.size),
			),
			lowStockCount: variants.filter((variant) => variant.low).length,
		};
	}
}
