"use server";

import { revalidatePath } from "next/cache";

import { retailContainer } from "@/contexts/backend/shared/infrastructure/RetailContainer";

import { type ActionState, initialActionState } from "../ActionState";
import { actionStateFor } from "../actionStateFor";

import { requiredVariantId } from "./requiredVariantId";

export async function removeCartLine(
	_previousState: ActionState,
	formData: FormData,
): Promise<ActionState> {
	try {
		await retailContainer.cartVariantRemover.remove(
			requiredVariantId(formData),
		);
	} catch (error) {
		return actionStateFor(error);
	}

	revalidatePath("/", "layout");

	return initialActionState;
}
