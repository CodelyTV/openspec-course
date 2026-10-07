import { CodelyError } from "@/contexts/shared/domain/CodelyError";

export class OutfitNameAlreadyExistsError extends CodelyError {
	constructor(name: string) {
		super(`An outfit named ${name} already exists.`);
	}
}
