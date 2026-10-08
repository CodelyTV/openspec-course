import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { retailContainer } from "@/contexts/backend/shared/infrastructure/RetailContainer";
import { PageHeader } from "@/contexts/frontend/retail/sections/PageHeader";

import { DeleteOutfitForm } from "../DeleteOutfitForm";
import { OutfitForm } from "../OutfitForm";

import styles from "./page.module.scss";

export const metadata: Metadata = { title: "Edit outfit" };

type AdminOutfitPageProps = {
	params: Promise<{ id: string }>;
};

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
				description="Change the name or the products of this outfit."
			/>
			<OutfitForm
				products={products.map(({ id, name }) => ({ id, name }))}
				outfit={outfit}
			/>
			<div className={styles.danger}>
				<DeleteOutfitForm outfitId={outfit.id} />
			</div>
		</div>
	);
}
