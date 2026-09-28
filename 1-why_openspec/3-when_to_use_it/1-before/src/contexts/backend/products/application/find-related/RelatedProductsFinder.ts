import { ProductNotFoundError } from "../../domain/errors/ProductNotFoundError";
import { ProductId } from "../../domain/ProductId";
import type { ProductRepository } from "../../domain/ProductRepository";
import { type ProductResponse, toProductResponse } from "../ProductResponse";

const relatedProductsShown = 4;

export class RelatedProductsFinder {
	constructor(private readonly repository: ProductRepository) {}

	async find(productId: string): Promise<ProductResponse[]> {
		const product = await this.repository.search(new ProductId(productId));

		if (!product) {
			throw new ProductNotFoundError(productId);
		}

		const related = await this.repository.searchOthersSameCollectionFirst(
			product,
			relatedProductsShown,
		);

		return related.map(toProductResponse);
	}
}
