import { OutfitId } from "../../domain/OutfitId";
import type { OutfitRepository } from "../../domain/OutfitRepository";

export class OutfitDeleter {
	constructor(private readonly outfitRepository: OutfitRepository) {}

	async delete(id: string): Promise<void> {
		await this.outfitRepository.delete(new OutfitId(id));
	}
}
