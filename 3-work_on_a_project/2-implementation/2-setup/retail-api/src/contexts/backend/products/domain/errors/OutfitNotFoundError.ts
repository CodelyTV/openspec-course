import { CodelyError } from "@/contexts/shared/domain/CodelyError";

export class OutfitNotFoundError extends CodelyError {
	constructor(outfitId: string) {
		super(`Outfit ${outfitId} not found`);
	}
}
