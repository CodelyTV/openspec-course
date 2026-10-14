import { InvalidArgumentError } from "@/contexts/shared/domain/errors/InvalidArgumentError";

export function requiredOrderId(formData: FormData): string {
	const orderId = formData.get("orderId");

	if (typeof orderId !== "string" || orderId.length === 0) {
		throw new InvalidArgumentError("orderId is required");
	}

	return orderId;
}
