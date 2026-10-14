"use server";

import { revalidatePath } from "next/cache";

import { retailApi } from "@/contexts/frontend/retail/api/RetailApi";

import { type ActionState, initialActionState } from "../ActionState";
import { actionStateFor } from "../actionStateFor";

import { reviewFormFields } from "./reviewFormFields";
import { reviewMessages } from "./reviewMessages";

export async function submitReview(
	_previousState: ActionState,
	formData: FormData,
): Promise<ActionState> {
	try {
		const { productId, rating, title, body } = reviewFormFields(formData);
		await retailApi.reviewSubmitter.submit(productId, rating, title, body);
	} catch (error) {
		return actionStateFor(error, reviewMessages);
	}

	revalidatePath("/products/[id]", "page");

	return initialActionState;
}
