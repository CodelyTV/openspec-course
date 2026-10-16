"use server";

import { revalidatePath } from "next/cache";
import { notFound } from "next/navigation";

import { OrderNotFoundError } from "@/contexts/backend/orders/domain/errors/OrderNotFoundError";
import { retailContainer } from "@/contexts/backend/shared/infrastructure/RetailContainer";

export async function cancelOrder(orderId: string): Promise<void> {
	try {
		await retailContainer.userOrderCanceller.cancel(orderId);
	} catch (error) {
		if (error instanceof OrderNotFoundError) {
			notFound();
		}

		throw error;
	}

	revalidatePath("/", "layout");
}
