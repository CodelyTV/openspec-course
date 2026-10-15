"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { retailApi } from "@/contexts/frontend/retail/api/RetailApi";

import type { ActionState } from "../ActionState";
import { actionStateFor, type UserFacingMessages } from "../actionStateFor";

const confirmationMessages: UserFacingMessages = [
	[
		"VariantOutOfStockError",
		"One of the items in your cart doesn't have enough stock left. Review it and try again.",
	],
];

export async function confirmOrder(
	_previousState: ActionState,
): Promise<ActionState> {
	let orderId: string;

	try {
		orderId = await retailApi.checkoutConfirmer.confirm();
	} catch (error) {
		return actionStateFor(error, confirmationMessages);
	}

	revalidatePath("/", "layout");
	redirect(`/checkout?order=${encodeURIComponent(orderId)}`);
}
