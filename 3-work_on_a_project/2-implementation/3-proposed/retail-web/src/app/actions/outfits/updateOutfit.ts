"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { retailApi } from "@/contexts/frontend/retail/api/RetailApi";

import type { ActionState } from "../ActionState";
import { actionStateFor } from "../actionStateFor";

import { outfitFormFields, requiredOutfitId } from "./outfitFormFields";
import { outfitMessages } from "./outfitMessages";

export async function updateOutfit(
	_previousState: ActionState,
	formData: FormData,
): Promise<ActionState> {
	try {
		const { name, productIds } = outfitFormFields(formData);
		await retailApi.outfitUpdater.update(
			requiredOutfitId(formData),
			name,
			productIds,
		);
	} catch (error) {
		return actionStateFor(error, outfitMessages);
	}

	revalidatePath("/", "layout");
	redirect("/admin/outfits");
}
