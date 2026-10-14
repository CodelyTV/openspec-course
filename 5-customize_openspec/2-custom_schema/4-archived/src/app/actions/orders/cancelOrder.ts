"use server";

import { revalidatePath } from "next/cache";

import { OrderNotFoundError } from "@/contexts/backend/orders/domain/errors/OrderNotFoundError";
import { retailContainer } from "@/contexts/backend/shared/infrastructure/RetailContainer";

import { type ActionState, initialActionState } from "../ActionState";
import { actionStateFor, type UserFacingMessages } from "../actionStateFor";

import { requiredOrderId } from "./requiredOrderId";

const cancelOrderMessages: UserFacingMessages = [
	[OrderNotFoundError, "This order was not found."],
];

export async function cancelOrder(
	_previousState: ActionState,
	formData: FormData,
): Promise<ActionState> {
	try {
		await retailContainer.userOrderCanceller.cancel(
			requiredOrderId(formData),
		);
	} catch (error) {
		return actionStateFor(error, cancelOrderMessages);
	}

	revalidatePath("/", "layout");

	return initialActionState;
}
