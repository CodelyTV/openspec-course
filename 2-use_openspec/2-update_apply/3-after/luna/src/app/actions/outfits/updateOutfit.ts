"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { retailContainer } from "@/contexts/backend/shared/infrastructure/RetailContainer";

import type { ActionState } from "../ActionState";
import { actionStateFor } from "../actionStateFor";

import { outfitMessages } from "./outfitMessages";

export async function updateOutfit(
	_state: ActionState,
	data: FormData,
): Promise<ActionState> {
	try {
		await retailContainer.outfitUpdater.update(
			String(data.get("id") ?? ""),
			String(data.get("name") ?? ""),
			data.getAll("productIds").map(String).filter(Boolean),
		);
	} catch (error) {
		return actionStateFor(error, outfitMessages);
	}
	revalidatePath("/admin/outfits");
	redirect("/admin/outfits");
}
