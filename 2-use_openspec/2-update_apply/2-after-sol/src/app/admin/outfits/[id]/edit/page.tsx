import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { retailContainer } from "@/contexts/backend/shared/infrastructure/RetailContainer";
import { PageHeader } from "@/contexts/frontend/retail/sections/PageHeader";

import { OutfitForm } from "../../OutfitForm";

export const metadata: Metadata = { title: "Edit outfit" };
export default async function EditOutfitPage({
	params,
}: {
	params: Promise<{ id: string }>;
}): Promise<React.JSX.Element> {
	const outfit = await retailContainer.outfitFinder.find((await params).id);
	if (!outfit) {
		notFound();
	}
	const products = await retailContainer.productsSearcher.search();

	return (
		<div>
			<PageHeader
				size="compact"
				eyebrow="Outfits"
				title="Edit outfit"
				description="Update the name and ordered pieces."
			/>
			<OutfitForm products={products} outfit={outfit} />
		</div>
	);
}
