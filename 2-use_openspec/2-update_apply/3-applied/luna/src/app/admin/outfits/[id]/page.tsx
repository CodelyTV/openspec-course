import { notFound } from "next/navigation";

import { deleteOutfit } from "@/app/actions/outfits/deleteOutfit";
import { updateOutfit } from "@/app/actions/outfits/updateOutfit";
import { retailContainer } from "@/contexts/backend/shared/infrastructure/RetailContainer";

import { OutfitForm } from "../OutfitForm";

export default async function EditOutfitPage({
	params,
}: {
	params: Promise<{ id: string }>;
}): Promise<React.JSX.Element> {
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
			<h1>Edit {outfit.name}</h1>
			<OutfitForm
				outfit={outfit}
				products={products}
				action={updateOutfit}
				deleteAction={deleteOutfit}
			/>
		</div>
	);
}
