import { retailApi } from "@/contexts/frontend/retail/api/RetailApi";

import { MainNavLinks } from "./MainNavLinks";

export async function MainNav(): Promise<React.JSX.Element> {
	const collections = await retailApi.collectionsLister.list();

	return <MainNavLinks collections={collections} />;
}
