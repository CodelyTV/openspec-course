import { OutfitId } from "../../domain/OutfitId";
import type { OutfitRepository } from "../../domain/OutfitRepository";
import type { OutfitResponse } from "../OutfitResponse";

export class OutfitFinder {
	constructor(private readonly repository: OutfitRepository) {}
	async find(id: string): Promise<OutfitResponse | null> {
		return (
			(await this.repository.search(new OutfitId(id)))?.toPrimitives() ??
			null
		);
	}
}
