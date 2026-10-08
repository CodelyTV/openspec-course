import type { Outfit } from "../domain/Outfit";

export type OutfitResponse = {
	id: string;
	name: string;
	productIds: string[];
};

export type OutfitSummaryResponse = {
	id: string;
	name: string;
	productCount: number;
	outOfStockProductNames: string[];
};

export function toOutfitResponse(outfit: Outfit): OutfitResponse {
	return outfit.toPrimitives();
}
