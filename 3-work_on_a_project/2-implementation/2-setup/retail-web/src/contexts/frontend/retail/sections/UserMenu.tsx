import { retailApi } from "@/contexts/frontend/retail/api/RetailApi";

import { UserMenuTrigger } from "./UserMenuTrigger";

export async function UserMenu(): Promise<React.JSX.Element> {
	const user = await retailApi.currentUserGetter.get();

	return <UserMenuTrigger name={user.name} email={user.email} />;
}
