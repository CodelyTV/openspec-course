"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { retailContainer } from "@/contexts/backend/shared/infrastructure/RetailContainer";

import type { ActionState } from "../ActionState";
import { actionStateFor } from "../actionStateFor";

import { requiredOutfitId } from "./outfitFormFields";
import { outfitMessages } from "./outfitMessages";

export async function deleteOutfit(
	_previousState: ActionState,
	formData: FormData,
): Promise<ActionState> {
	try {
		await retailContainer.outfitDeleter.delete(requiredOutfitId(formData));
	} catch (error) {
		return actionStateFor(error, outfitMessages);
	}

	revalidatePath("/", "layout");
	redirect("/admin/outfits");
}
