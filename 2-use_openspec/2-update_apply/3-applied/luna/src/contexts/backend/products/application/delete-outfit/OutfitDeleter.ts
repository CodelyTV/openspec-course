import { OutfitId } from "../../domain/OutfitId";
import type { OutfitRepository } from "../../domain/OutfitRepository";

export class OutfitDeleter {
	constructor(private readonly repository: OutfitRepository) {}
	async delete(id: string): Promise<void> {
		await this.repository.delete(new OutfitId(id));
	}
}
