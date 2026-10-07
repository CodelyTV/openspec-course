import type { Metadata } from "next";

import { retailContainer } from "@/contexts/backend/shared/infrastructure/RetailContainer";
import { PageHeader } from "@/contexts/frontend/retail/sections/PageHeader";

import { OutfitForm } from "../OutfitForm";

export const metadata: Metadata = { title: "Create outfit" };
export default async function NewOutfitPage(): Promise<React.JSX.Element> {
	const products = await retailContainer.productsSearcher.search();

	return (
		<div>
			<PageHeader
				size="compact"
				eyebrow="Outfits"
				title="Create outfit"
				description="Curate a complete look from the catalog."
			/>
			<OutfitForm products={products} />
		</div>
	);
}
