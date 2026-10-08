import type { Metadata } from "next";

import { retailContainer } from "@/contexts/backend/shared/infrastructure/RetailContainer";
import { PageHeader } from "@/contexts/frontend/retail/sections/PageHeader";

import { OutfitForm } from "../OutfitForm";

export const metadata: Metadata = { title: "New outfit" };

export default async function AdminNewOutfitPage(): Promise<React.JSX.Element> {
	const products = await retailContainer.productsSearcher.search();

	return (
		<div>
			<PageHeader
				size="compact"
				eyebrow="Outfits"
				title="New outfit"
				description="Pick between 2 and 4 products, in the order customers will see them."
			/>
			<OutfitForm
				products={products.map(({ id, name }) => ({ id, name }))}
			/>
		</div>
	);
}
