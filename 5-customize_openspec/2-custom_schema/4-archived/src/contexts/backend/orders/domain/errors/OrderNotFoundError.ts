import { CodelyError } from "@/contexts/shared/domain/CodelyError";

export class OrderNotFoundError extends CodelyError {
	constructor(id: string) {
		super(`Order ${id} not found`);
	}
}
