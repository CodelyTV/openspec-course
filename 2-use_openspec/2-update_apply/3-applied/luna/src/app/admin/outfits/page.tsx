import Link from "next/link";

import { retailContainer } from "@/contexts/backend/shared/infrastructure/RetailContainer";
import { OutfitsTable } from "@/contexts/frontend/retail/sections/OutfitsTable";
import { PageHeader } from "@/contexts/frontend/retail/sections/PageHeader";

export const metadata = { title: "Outfits" };
export default async function AdminOutfitsPage(): Promise<React.JSX.Element> {
	const outfits = await retailContainer.outfitsLister.list();

	return (
		<div>
			<PageHeader
				size="compact"
				eyebrow="Merchandising"
				title="Outfits"
				description="Curate products into complete looks."
			/>
			<p>
				<Link href="/admin/outfits/new">New outfit</Link>
			</p>
			<OutfitsTable outfits={outfits} />
		</div>
	);
}
