import type { UserFacingMessages } from "../actionStateFor";

export const outfitMessages: UserFacingMessages = [
	["InvalidOutfitNameError", "The outfit name is required."],
	["InvalidOutfitSizeError", "An outfit needs between 2 and 4 products."],
	[
		"RepeatedOutfitProductError",
		"A product can only appear once in an outfit.",
	],
	[
		"OutfitProductNotFoundError",
		"One of the products is no longer available.",
	],
	[
		"OutfitNameAlreadyExistsError",
		"An outfit with that name already exists.",
	],
	["OutfitNotFoundError", "This outfit no longer exists."],
];
