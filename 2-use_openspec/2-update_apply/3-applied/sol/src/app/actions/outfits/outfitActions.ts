"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
	InvalidOutfitNameError,
	InvalidOutfitSizeError,
	OutfitNameAlreadyExistsError,
	OutfitNotFoundError,
	OutfitProductNotFoundError,
	RepeatedOutfitProductError,
} from "@/contexts/backend/products/domain/errors/OutfitErrors";
import { retailContainer } from "@/contexts/backend/shared/infrastructure/RetailContainer";

import type { ActionState } from "../ActionState";
import { actionStateFor, type UserFacingMessages } from "../actionStateFor";

const outfitMessages: UserFacingMessages = [
	[InvalidOutfitNameError, "The outfit name is required."],
	[InvalidOutfitSizeError, "An outfit needs between 2 and 4 products."],
	[
		RepeatedOutfitProductError,
		"A product can only appear once in an outfit.",
	],
	[OutfitNameAlreadyExistsError, "An outfit with that name already exists."],
	[OutfitProductNotFoundError, "One of the products is no longer available."],
	[OutfitNotFoundError, "The outfit no longer exists."],
];

function fields(formData: FormData): { name: string; productIds: string[] } {
	return {
		name: String(formData.get("name") ?? ""),
		productIds: formData.getAll("productIds").map(String).filter(Boolean),
	};
}

function finish(): never {
	revalidatePath("/", "layout");
	redirect("/admin/outfits");
}

export async function createOutfit(
	_previous: ActionState,
	formData: FormData,
): Promise<ActionState> {
	try {
		const { name, productIds } = fields(formData);
		await retailContainer.outfitCreator.create(name, productIds);
	} catch (error) {
		return actionStateFor(error, outfitMessages);
	}
	finish();
}

export async function updateOutfit(
	id: string,
	_previous: ActionState,
	formData: FormData,
): Promise<ActionState> {
	try {
		const { name, productIds } = fields(formData);
		await retailContainer.outfitUpdater.update(id, name, productIds);
	} catch (error) {
		return actionStateFor(error, outfitMessages);
	}
	finish();
}

export async function deleteOutfit(
	id: string,
	_previous: ActionState,
	_formData: FormData,
): Promise<ActionState> {
	try {
		await retailContainer.outfitDeleter.delete(id);
	} catch (error) {
		return actionStateFor(error, outfitMessages);
	}
	finish();
}
