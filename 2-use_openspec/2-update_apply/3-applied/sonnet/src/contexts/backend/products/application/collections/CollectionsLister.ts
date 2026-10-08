import type { ProductRepository } from "../../domain/ProductRepository";

export class CollectionsLister {
	constructor(private readonly repository: ProductRepository) {}

	async list(): Promise<string[]> {
		return this.repository.searchCollections();
	}
}
