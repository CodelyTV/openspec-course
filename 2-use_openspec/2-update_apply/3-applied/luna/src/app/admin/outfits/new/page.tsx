import { createOutfit } from "@/app/actions/outfits/createOutfit";
import { retailContainer } from "@/contexts/backend/shared/infrastructure/RetailContainer";

import { OutfitForm } from "../OutfitForm";

export const metadata = { title: "New outfit" };
export default async function NewOutfitPage(): Promise<React.JSX.Element> {
	const products = await retailContainer.productsSearcher.search();

	return (
		<div>
			<h1>New outfit</h1>
			<OutfitForm products={products} action={createOutfit} />
		</div>
	);
}
