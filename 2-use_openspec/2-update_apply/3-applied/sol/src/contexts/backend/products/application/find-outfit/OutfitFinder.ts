import { OutfitId } from "../../domain/OutfitId";
import type { OutfitRepository } from "../../domain/OutfitRepository";

export type OutfitResponse = { id: string; name: string; productIds: string[] };

export class OutfitFinder {
	constructor(private readonly outfits: OutfitRepository) {}

	async find(id: string): Promise<OutfitResponse | null> {
		const outfit = await this.outfits.search(new OutfitId(id));

		return outfit?.toPrimitives() ?? null;
	}
}
