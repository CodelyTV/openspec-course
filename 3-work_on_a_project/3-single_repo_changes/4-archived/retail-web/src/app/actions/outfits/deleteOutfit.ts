"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { retailApi } from "@/contexts/frontend/retail/api/RetailApi";

import type { ActionState } from "../ActionState";
import { actionStateFor } from "../actionStateFor";

import { requiredOutfitId } from "./outfitFormFields";
import { outfitMessages } from "./outfitMessages";

export async function deleteOutfit(
	_previousState: ActionState,
	formData: FormData,
): Promise<ActionState> {
	try {
		await retailApi.outfitDeleter.delete(requiredOutfitId(formData));
	} catch (error) {
		return actionStateFor(error, outfitMessages);
	}

	revalidatePath("/", "layout");
	redirect("/admin/outfits");
}
