import { CurrentUserProvider } from "@/contexts/shared/domain/CurrentUserProvider";
import { UserId } from "@/contexts/shared/domain/UserId";

// Stands in for reading a real session/JWT; swap for a real adapter once the app has auth.
export class FakeSessionCurrentUserProvider extends CurrentUserProvider {
	async currentUserId(): Promise<UserId> {
		return new UserId("user-a1c92f04");
	}
}
