import { CodelyError } from "@/contexts/shared/domain/CodelyError";

export class OutfitNotFoundError extends CodelyError {
	constructor(id: string) {
		super(`Outfit ${id} was not found.`);
	}
}
