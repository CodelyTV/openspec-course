import { retailApi } from "@/contexts/frontend/retail/api/RetailApi";

import { CartLinkView } from "./CartLinkView";

export async function CartLink(): Promise<React.JSX.Element> {
	const itemCount = await retailApi.cartItemCounter.count();

	return <CartLinkView itemCount={itemCount} />;
}
