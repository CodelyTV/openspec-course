"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { retailContainer } from "@/contexts/backend/shared/infrastructure/RetailContainer";

import type { ActionState } from "../ActionState";
import { actionStateFor } from "../actionStateFor";

import { requiredVariantId } from "./requiredVariantId";

export async function addSelectedVariantToCart(
	_previousState: ActionState,
	formData: FormData,
): Promise<ActionState> {
	try {
		await retailContainer.cartVariantAdder.add(requiredVariantId(formData));
	} catch (error) {
		return actionStateFor(error);
	}

	revalidatePath("/", "layout");
	redirect("/checkout");
}
