"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { retailContainer } from "@/contexts/backend/shared/infrastructure/RetailContainer";

import type { ActionState } from "../ActionState";
import { actionStateFor } from "../actionStateFor";

import { outfitMessages } from "./outfitMessages";

export async function deleteOutfit(
	_state: ActionState,
	data: FormData,
): Promise<ActionState> {
	try {
		await retailContainer.outfitDeleter.delete(
			String(data.get("id") ?? ""),
		);
	} catch (error) {
		return actionStateFor(error, outfitMessages);
	}
	revalidatePath("/admin/outfits");
	redirect("/admin/outfits");
}
