"use server";

import { revalidatePath } from "next/cache";

import { retailApi } from "@/contexts/frontend/retail/api/RetailApi";

import { type ActionState, initialActionState } from "../ActionState";
import { actionStateFor } from "../actionStateFor";

import { requiredReviewId } from "./reviewFormFields";
import { reviewMessages } from "./reviewMessages";

export async function rejectReview(
	_previousState: ActionState,
	formData: FormData,
): Promise<ActionState> {
	try {
		await retailApi.reviewRejecter.reject(requiredReviewId(formData));
	} catch (error) {
		return actionStateFor(error, reviewMessages);
	}

	revalidatePath("/", "layout");

	return initialActionState;
}
