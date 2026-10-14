"use server";

import { revalidatePath } from "next/cache";

import { VariantNotFoundError } from "@/contexts/backend/products/domain/errors/VariantNotFoundError";
import { retailContainer } from "@/contexts/backend/shared/infrastructure/RetailContainer";

import { actionStateFor, type UserFacingMessages } from "../actionStateFor";
import { requiredVariantId } from "../checkout/requiredVariantId";

import type { RestockAlertActionState } from "./RestockAlertActionState";

const restockAlertMessages: UserFacingMessages = [
	[VariantNotFoundError, "The selected variant is no longer available."],
];

export async function requestRestockAlert(
	_previousState: RestockAlertActionState,
	formData: FormData,
): Promise<RestockAlertActionState> {
	try {
		await retailContainer.restockAlertRequester.request(
			requiredVariantId(formData),
		);
	} catch (error) {
		return {
			...actionStateFor(error, restockAlertMessages),
			isAlertActive: false,
		};
	}

	revalidatePath("/products/[id]", "page");

	return { error: null, isAlertActive: true };
}
