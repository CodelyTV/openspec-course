import { CodelyError } from "@/contexts/shared/domain/CodelyError";
import type { UserId } from "@/contexts/shared/domain/UserId";

export class UserNotFoundError extends CodelyError {
	constructor(userId: UserId) {
		super(`User ${userId.value} not found`);
	}
}
