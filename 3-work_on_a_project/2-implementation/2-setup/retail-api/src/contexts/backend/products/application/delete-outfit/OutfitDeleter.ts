import { OutfitNotFoundError } from "../../domain/errors/OutfitNotFoundError";
import { OutfitId } from "../../domain/OutfitId";
import type { OutfitRepository } from "../../domain/OutfitRepository";

export class OutfitDeleter {
	constructor(private readonly repository: OutfitRepository) {}

	async delete(id: string): Promise<void> {
		const outfit = await this.repository.search(new OutfitId(id));

		if (!outfit) {
			throw new OutfitNotFoundError(id);
		}

		await this.repository.delete(outfit.id);
	}
}
