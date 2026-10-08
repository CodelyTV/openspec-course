import {
	OutfitNameAlreadyExistsError,
	OutfitNotFoundError,
	OutfitProductNotFoundError,
} from "@/contexts/backend/products/domain/errors/OutfitErrors";
import {
	InvalidOutfitNameError,
	InvalidOutfitSizeError,
	RepeatedOutfitProductError,
} from "@/contexts/backend/products/domain/Outfit";

import type { UserFacingMessages } from "../actionStateFor";

export const outfitMessages: UserFacingMessages = [
	[InvalidOutfitNameError, "A name is required."],
	[InvalidOutfitSizeError, "An outfit needs between 2 and 4 products."],
	[
		RepeatedOutfitProductError,
		"A product can only appear once in an outfit.",
	],
	[OutfitNameAlreadyExistsError, "An outfit with that name already exists."],
	[OutfitNotFoundError, "The outfit no longer exists."],
	[OutfitProductNotFoundError, "One of the products is no longer available."],
];
