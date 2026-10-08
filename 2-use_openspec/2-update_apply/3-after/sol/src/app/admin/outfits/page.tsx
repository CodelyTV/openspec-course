import type { Metadata } from "next";
import Link from "next/link";

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
				eyebrow="Catalog"
				title="Outfits"
				description="Curate complete looks from catalog products."
			/>
			<p>
				<Link href="/admin/outfits/new">New outfit</Link>
			</p>
			<OutfitsTable outfits={outfits} />
		</div>
	);
}
