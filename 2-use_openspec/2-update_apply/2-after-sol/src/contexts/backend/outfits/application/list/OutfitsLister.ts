import type { OutfitRepository } from "../../domain/OutfitRepository";
import type { OutfitResponse } from "../OutfitResponse";

export class OutfitsLister {
	constructor(private readonly repository: OutfitRepository) {}
	async list(): Promise<OutfitResponse[]> {
		const outfits = await this.repository.searchAll();

		return outfits
			.map((outfit) => outfit.toPrimitives())
			.sort((a, b) => a.name.localeCompare(b.name));
	}
}
