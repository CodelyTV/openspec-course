import type { OutfitRepository } from "../../domain/OutfitRepository";
import type { ProductRepository } from "../../domain/ProductRepository";
import { type Size, sizeOrder } from "../../domain/ProductVariant";
import type { RestockAlertRepository } from "../../domain/RestockAlertRepository";

export type InventoryResponse = {
	productName: string;
	collection: string;
	color: string;
	size: Size;
	stock: number;
	low: boolean;
	inOutfit: boolean;
	waiting: number;
};

export type InventoryReportResponse = {
	variants: InventoryResponse[];
	lowStockCount: number;
};

export class InventoryLister {
	constructor(
		private readonly repository: ProductRepository,
		private readonly outfitRepository: OutfitRepository,
		private readonly restockAlertRepository: RestockAlertRepository,
	) {}

	async list(): Promise<InventoryReportResponse> {
		const [products, outfitCountByProductId, waitingByVariantId] =
			await Promise.all([
				this.repository.searchAll(),
				this.outfitRepository.countOutfitsByProduct(),
				this.restockAlertRepository.countByVariant(),
			]);

		const variants = products.flatMap((product) =>
			product.variants.map((variant) => ({
				productName: product.name,
				collection: product.collection,
				color: variant.color,
				size: variant.size,
				stock: variant.onlineStock,
				low: variant.isLowStock(),
				inOutfit:
					(outfitCountByProductId.get(product.id.value) ?? 0) > 0,
				waiting: waitingByVariantId.get(variant.id.value) ?? 0,
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
