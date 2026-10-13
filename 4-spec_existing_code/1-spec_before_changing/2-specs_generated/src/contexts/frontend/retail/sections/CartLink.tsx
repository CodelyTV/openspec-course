import { retailContainer } from "@/contexts/backend/shared/infrastructure/RetailContainer";

import { CartLinkView } from "./CartLinkView";

export async function CartLink(): Promise<React.JSX.Element> {
	const itemCount = await retailContainer.cartItemCounter.count();

	return <CartLinkView itemCount={itemCount} />;
}
