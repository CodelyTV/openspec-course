import { OutfitId } from "../../domain/OutfitId";
import type { OutfitRepository } from "../../domain/OutfitRepository";

export type OutfitResponse = {
	id: string;
	name: string;
	productIds: string[];
};

export class OutfitFinder {
	constructor(private readonly repository: OutfitRepository) {}

	async find(id: string): Promise<OutfitResponse | null> {
		const isBlankId = id.trim().length === 0;

		if (isBlankId) {
			return null;
		}

		const outfit = await this.repository.search(new OutfitId(id));

		return outfit ? outfit.toPrimitives() : null;
	}
}
