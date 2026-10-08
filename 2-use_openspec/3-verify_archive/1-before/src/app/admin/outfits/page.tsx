import type { Metadata } from "next";

import { retailContainer } from "@/contexts/backend/shared/infrastructure/RetailContainer";
import { Button } from "@/contexts/frontend/design-system/atoms/Button";
import { OutfitsTable } from "@/contexts/frontend/retail/sections/OutfitsTable";
import { PageHeader } from "@/contexts/frontend/retail/sections/PageHeader";

import styles from "./page.module.scss";

export const metadata: Metadata = { title: "Outfits" };

export default async function AdminOutfitsPage(): Promise<React.JSX.Element> {
	const outfits = await retailContainer.outfitsLister.list();

	return (
		<div>
			<PageHeader
				size="compact"
				eyebrow="Outfits"
				title="Outfits"
				description={`${outfits.length} curated looks shown on the product pages.`}
			/>
			<div className={styles.toolbar}>
				<Button href="/admin/outfits/new" size="small">
					New outfit
				</Button>
			</div>
			<OutfitsTable outfits={outfits} />
		</div>
	);
}
