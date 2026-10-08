import type { UserId } from "@/contexts/shared/domain/UserId";

export abstract class ReviewAuthors {
	abstract nameOf(userId: UserId): Promise<string>;
}
