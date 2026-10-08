import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { retailContainer } from "@/contexts/backend/shared/infrastructure/RetailContainer";
import { PageHeader } from "@/contexts/frontend/retail/sections/PageHeader";

import { OutfitForm } from "../OutfitForm";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	return { title: `Edit outfit ${(await params).id}` };
}

export default async function EditOutfitPage({
	params,
}: Props): Promise<React.JSX.Element> {
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
				description="Edit or delete this outfit."
			/>
			<OutfitForm
				outfit={outfit}
				products={products.map(({ id: productId, name }) => ({
					id: productId,
					name,
				}))}
			/>
		</div>
	);
}
