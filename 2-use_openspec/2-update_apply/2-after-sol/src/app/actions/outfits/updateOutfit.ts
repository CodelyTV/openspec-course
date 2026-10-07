"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { retailContainer } from "@/contexts/backend/shared/infrastructure/RetailContainer";

import { type ActionState } from "../ActionState";
import { actionStateFor } from "../actionStateFor";

import { outfitFormData, outfitId } from "./outfitFormData";
import { outfitMessages } from "./outfitMessages";

export async function updateOutfit(
	_previousState: ActionState,
	formData: FormData,
): Promise<ActionState> {
	try {
		const { name, productIds } = outfitFormData(formData);
		await retailContainer.outfitUpdater.update(
			outfitId(formData),
			name,
			productIds,
		);
	} catch (error) {
		return actionStateFor(error, outfitMessages);
	}
	revalidatePath("/", "layout");
	redirect("/admin/outfits");
}
