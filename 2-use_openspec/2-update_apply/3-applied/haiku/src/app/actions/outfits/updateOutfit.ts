"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { retailContainer } from "@/contexts/backend/shared/infrastructure/RetailContainer";

import type { ActionState } from "../ActionState";
import { actionStateFor } from "../actionStateFor";

import {
	outfitIdFrom,
	outfitNameFrom,
	outfitProductIdsFrom,
} from "./outfitFormData";
import { outfitMessages } from "./outfitMessages";

export async function updateOutfit(
	_previousState: ActionState,
	formData: FormData,
): Promise<ActionState> {
	try {
		await retailContainer.outfitUpdater.update(
			outfitIdFrom(formData),
			outfitNameFrom(formData),
			outfitProductIdsFrom(formData),
		);
	} catch (error) {
		return actionStateFor(error, outfitMessages);
	}

	revalidatePath("/", "layout");
	redirect("/admin/outfits");
}
