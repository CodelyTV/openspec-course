"use server";

import { revalidatePath } from "next/cache";

import { retailApi } from "@/contexts/frontend/retail/api/RetailApi";

import { type ActionState, initialActionState } from "../ActionState";
import { actionStateFor } from "../actionStateFor";

import { reviewSubmissionOf } from "./reviewFormFields";
import { reviewMessages } from "./reviewMessages";

export async function submitReview(
	_previousState: ActionState,
	formData: FormData,
): Promise<ActionState> {
	let productId: string;

	try {
		const review = reviewSubmissionOf(formData);
		productId = review.productId;
		await retailApi.reviewSubmitter.submit(review);
	} catch (error) {
		return actionStateFor(error, reviewMessages);
	}

	revalidatePath(`/products/${encodeURIComponent(productId)}`);

	return initialActionState;
}
