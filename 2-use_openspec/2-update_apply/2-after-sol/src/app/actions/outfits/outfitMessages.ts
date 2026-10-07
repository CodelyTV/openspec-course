import { EmptyOutfitNameError } from "@/contexts/backend/outfits/domain/errors/EmptyOutfitNameError";
import { InvalidOutfitPiecesCountError } from "@/contexts/backend/outfits/domain/errors/InvalidOutfitPiecesCountError";
import { OutfitNameAlreadyExistsError } from "@/contexts/backend/outfits/domain/errors/OutfitNameAlreadyExistsError";
import { OutfitNotFoundError } from "@/contexts/backend/outfits/domain/errors/OutfitNotFoundError";
import { OutfitProductNotFoundError } from "@/contexts/backend/outfits/domain/errors/OutfitProductNotFoundError";
import { RepeatedOutfitProductError } from "@/contexts/backend/outfits/domain/errors/RepeatedOutfitProductError";

import type { UserFacingMessages } from "../actionStateFor";

export const outfitMessages: UserFacingMessages = [
	[EmptyOutfitNameError, "An outfit name is required."],
	[
		InvalidOutfitPiecesCountError,
		"An outfit needs between 2 and 4 products.",
	],
	[
		RepeatedOutfitProductError,
		"A product can only appear once in an outfit.",
	],
	[OutfitProductNotFoundError, "One of the products is no longer available."],
	[OutfitNotFoundError, "This outfit no longer exists."],
	[OutfitNameAlreadyExistsError, "An outfit with this name already exists."],
];
