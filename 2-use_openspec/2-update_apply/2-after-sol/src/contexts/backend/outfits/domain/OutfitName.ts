import { StringValueObject } from "@/contexts/shared/domain/value-object/StringValueObject";

import { EmptyOutfitNameError } from "./errors/EmptyOutfitNameError";

export class OutfitName extends StringValueObject {
	constructor(value: string) {
		if (value.trim().length === 0) {
			throw new EmptyOutfitNameError();
		}
		super(value);
	}
}
