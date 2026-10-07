import type { Metadata } from "next";

import { retailContainer } from "@/contexts/backend/shared/infrastructure/RetailContainer";
import { OutfitsTable } from "@/contexts/frontend/retail/sections/OutfitsTable";
import { PageHeader } from "@/contexts/frontend/retail/sections/PageHeader";

export const metadata: Metadata = { title: "Outfits" };
export default async function AdminOutfitsPage(): Promise<React.JSX.Element> {
	const outfits = await retailContainer.outfitsLister.list();

	return (
		<div>
			<PageHeader
				size="compact"
				eyebrow="Outfits"
				title="Outfits"
				description={`${outfits.length} curated outfits.`}
			/>
			<OutfitsTable outfits={outfits} />
		</div>
	);
}
