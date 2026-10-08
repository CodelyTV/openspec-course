import { OutfitNotFoundError } from "../../domain/errors/OutfitNotFoundError";
import { OutfitId } from "../../domain/OutfitId";
import type { OutfitRepository } from "../../domain/OutfitRepository";

export class OutfitDeleter {
	constructor(private readonly repository: OutfitRepository) {}

	async delete(id: string): Promise<void> {
		const outfitId = new OutfitId(id);

		if (!(await this.repository.search(outfitId))) {
			throw new OutfitNotFoundError(id);
		}

		await this.repository.delete(outfitId);
	}
}
