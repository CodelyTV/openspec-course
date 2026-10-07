import { ProductId } from "@/contexts/shared/domain/ProductId";

import type { ProductRepository } from "../../domain/ProductRepository";
import { type ProductResponse, toProductResponse } from "../ProductResponse";

export class ProductsByIdsSearcher {
	constructor(private readonly repository: ProductRepository) {}
	async search(ids: string[]): Promise<ProductResponse[]> {
		const distinctIds = [...new Set(ids)];
		if (distinctIds.length === 0) {
			return [];
		}
		const products = await this.repository.searchByIds(
			distinctIds.map((id) => new ProductId(id)),
		);

		return products.map(toProductResponse);
	}
}
