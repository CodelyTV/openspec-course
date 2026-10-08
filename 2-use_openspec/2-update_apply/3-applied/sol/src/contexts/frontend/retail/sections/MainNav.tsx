import { retailContainer } from "@/contexts/backend/shared/infrastructure/RetailContainer";

import { MainNavLinks } from "./MainNavLinks";

export async function MainNav(): Promise<React.JSX.Element> {
	const collections = await retailContainer.collectionsLister.list();

	return <MainNavLinks collections={collections} />;
}
