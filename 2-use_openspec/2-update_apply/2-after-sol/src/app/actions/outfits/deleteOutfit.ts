"use server";
import { revalidatePath } from "next/cache";

import { retailContainer } from "@/contexts/backend/shared/infrastructure/RetailContainer";

import { type ActionState, initialActionState } from "../ActionState";
import { actionStateFor } from "../actionStateFor";

import { outfitId } from "./outfitFormData";
import { outfitMessages } from "./outfitMessages";

export async function deleteOutfit(
	_previousState: ActionState,
	formData: FormData,
): Promise<ActionState> {
	try {
		await retailContainer.outfitDeleter.delete(outfitId(formData));
	} catch (error) {
		return actionStateFor(error, outfitMessages);
	}
	revalidatePath("/", "layout");

	return initialActionState;
}
