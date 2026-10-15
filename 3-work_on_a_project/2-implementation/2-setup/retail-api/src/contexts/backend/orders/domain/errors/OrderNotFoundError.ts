import { CodelyError } from "@/contexts/shared/domain/CodelyError";

export class OrderNotFoundError extends CodelyError {
	constructor(orderId: string) {
		super(`Order ${orderId} not found`);
	}
}
