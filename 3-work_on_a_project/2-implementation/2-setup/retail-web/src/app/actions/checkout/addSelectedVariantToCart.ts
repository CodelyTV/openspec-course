"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { retailApi } from "@/contexts/frontend/retail/api/RetailApi";

import type { ActionState } from "../ActionState";
import { actionStateFor, type UserFacingMessages } from "../actionStateFor";

import { requiredVariantId } from "./requiredVariantId";

const addToCartMessages: UserFacingMessages = [
	[
		"CatalogItemNotFoundError",
		"The selected variant is no longer available.",
	],
];

export async function addSelectedVariantToCart(
	_previousState: ActionState,
	formData: FormData,
): Promise<ActionState> {
	try {
		await retailApi.cartVariantAdder.add(requiredVariantId(formData));
	} catch (error) {
		return actionStateFor(error, addToCartMessages);
	}

	revalidatePath("/", "layout");
	redirect("/checkout");
}
