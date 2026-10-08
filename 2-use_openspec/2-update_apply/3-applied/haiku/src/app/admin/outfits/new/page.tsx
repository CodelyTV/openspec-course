import type { Metadata } from "next";

import { retailContainer } from "@/contexts/backend/shared/infrastructure/RetailContainer";
import { PageHeader } from "@/contexts/frontend/retail/sections/PageHeader";

import { OutfitForm } from "../OutfitForm";

export const metadata: Metadata = { title: "New outfit" };

export default async function NewOutfitPage(): Promise<React.JSX.Element> {
	const products = await retailContainer.productsSearcher.search();

	return (
		<div>
			<PageHeader
				size="compact"
				eyebrow="Outfits"
				title="New outfit"
				description="Name the look and pick 2 to 4 different products."
			/>
			<OutfitForm products={products} />
		</div>
	);
}
