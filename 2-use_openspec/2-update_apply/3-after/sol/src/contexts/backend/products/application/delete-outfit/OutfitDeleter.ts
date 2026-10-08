import { OutfitNotFoundError } from "../../domain/errors/OutfitErrors";
import { OutfitId } from "../../domain/OutfitId";
import type { OutfitRepository } from "../../domain/OutfitRepository";

export class OutfitDeleter {
	constructor(private readonly outfits: OutfitRepository) {}

	async delete(id: string): Promise<void> {
		const outfitId = new OutfitId(id);
		if (!(await this.outfits.search(outfitId))) {
			throw new OutfitNotFoundError();
		}
		await this.outfits.delete(outfitId);
	}
}
