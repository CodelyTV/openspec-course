import { retailContainer } from "@/contexts/backend/shared/infrastructure/RetailContainer";

import { UserMenuTrigger } from "./UserMenuTrigger";

export async function UserMenu(): Promise<React.JSX.Element> {
	const user = await retailContainer.currentUserGetter.get();

	return <UserMenuTrigger name={user.name} email={user.email} />;
}
