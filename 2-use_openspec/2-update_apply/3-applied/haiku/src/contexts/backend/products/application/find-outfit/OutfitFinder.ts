import { OutfitId } from "../../domain/OutfitId";
import type { OutfitRepository } from "../../domain/OutfitRepository";
import { type OutfitResponse, toOutfitResponse } from "../OutfitResponse";

export class OutfitFinder {
	constructor(private readonly outfitRepository: OutfitRepository) {}

	async find(id: string): Promise<OutfitResponse | null> {
		const outfit = await this.outfitRepository.search(new OutfitId(id));

		return outfit ? toOutfitResponse(outfit) : null;
	}
}
