import { CodelyError } from "@/contexts/shared/domain/CodelyError";

export class InvalidOutfitNameError extends CodelyError {
	constructor() {
		super("Outfit name is required");
	}
}

export class InvalidOutfitSizeError extends CodelyError {
	constructor() {
		super("An outfit needs between 2 and 4 products");
	}
}

export class RepeatedOutfitProductError extends CodelyError {
	constructor() {
		super("A product can only appear once in an outfit");
	}
}

export class OutfitNameAlreadyExistsError extends CodelyError {
	constructor() {
		super("An outfit with that name already exists");
	}
}

export class OutfitProductNotFoundError extends CodelyError {
	constructor() {
		super("One of the products is no longer available");
	}
}

export class OutfitNotFoundError extends CodelyError {
	constructor() {
		super("The outfit no longer exists");
	}
}
