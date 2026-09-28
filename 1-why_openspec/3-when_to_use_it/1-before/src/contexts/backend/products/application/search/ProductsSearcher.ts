import type {
	ProductCriteria,
	ProductRepository,
} from "../../domain/ProductRepository";
import { type ProductResponse, toProductResponse } from "../ProductResponse";

export type ProductFilters = ProductCriteria;

export class ProductsSearcher {
	constructor(private readonly repository: ProductRepository) {}

	async search(filters: ProductFilters = {}): Promise<ProductResponse[]> {
		const products = await this.repository.searchMatching(filters);

		return products.map(toProductResponse);
	}
}
