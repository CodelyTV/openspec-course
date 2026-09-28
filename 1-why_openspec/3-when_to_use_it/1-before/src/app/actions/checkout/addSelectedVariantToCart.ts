"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { CatalogItemNotFoundError } from "@/contexts/backend/checkout/domain/errors/CatalogItemNotFoundError";
import { retailContainer } from "@/contexts/backend/shared/infrastructure/RetailContainer";

import type { ActionState } from "../ActionState";
import { actionStateFor, type UserFacingMessages } from "../actionStateFor";

import { requiredVariantId } from "./requiredVariantId";

const addToCartMessages: UserFacingMessages = [
	[CatalogItemNotFoundError, "The selected variant is no longer available."],
];

export async function addSelectedVariantToCart(
	_previousState: ActionState,
	formData: FormData,
): Promise<ActionState> {
	try {
		await retailContainer.cartVariantAdder.add(requiredVariantId(formData));
	} catch (error) {
		return actionStateFor(error, addToCartMessages);
	}

	revalidatePath("/", "layout");
	redirect("/checkout");
}
