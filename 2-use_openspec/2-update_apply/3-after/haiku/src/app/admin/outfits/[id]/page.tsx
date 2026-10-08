import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { retailContainer } from "@/contexts/backend/shared/infrastructure/RetailContainer";
import { PageHeader } from "@/contexts/frontend/retail/sections/PageHeader";

import { OutfitForm } from "../OutfitForm";

import { DeleteOutfitForm } from "./DeleteOutfitForm";

type AdminOutfitPageProps = {
	params: Promise<{ id: string }>;
};

export const metadata: Metadata = { title: "Edit outfit" };

export default async function AdminOutfitPage({
	params,
}: AdminOutfitPageProps): Promise<React.JSX.Element> {
	const { id } = await params;
	const [outfit, products] = await Promise.all([
		retailContainer.outfitFinder.find(id),
		retailContainer.productsSearcher.search(),
	]);

	if (!outfit) {
		notFound();
	}

	return (
		<div>
			<PageHeader
				size="compact"
				eyebrow="Outfits"
				title={outfit.name}
				description={`${outfit.productIds.length} products in this outfit.`}
			/>
			<OutfitForm products={products} outfit={outfit} />
			<DeleteOutfitForm outfitId={outfit.id} />
		</div>
	);
}
