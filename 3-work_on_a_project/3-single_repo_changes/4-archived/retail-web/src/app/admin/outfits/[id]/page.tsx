import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { retailApi } from "@/contexts/frontend/retail/api/RetailApi";
import { PageHeader } from "@/contexts/frontend/retail/sections/PageHeader";

import { DeleteOutfitForm } from "../DeleteOutfitForm";
import { OutfitForm } from "../OutfitForm";
import { productOptionsOf } from "../productOptions";

import styles from "../page.module.scss";

type EditOutfitPageProps = {
	params: Promise<{ id: string }>;
};

export const metadata: Metadata = { title: "Edit outfit" };

export default async function EditOutfitPage({
	params,
}: EditOutfitPageProps): Promise<React.JSX.Element> {
	const { id } = await params;
	const [outfit, products] = await Promise.all([
		retailApi.outfitFinder.find(id),
		retailApi.productsSearcher.search(),
	]);

	if (!outfit) {
		notFound();
	}

	return (
		<div>
			<Link href="/admin/outfits" className={styles.back}>
				← Back to outfits
			</Link>
			<PageHeader
				size="compact"
				eyebrow="Outfits"
				title={outfit.name}
				description="Change the name or the pieces of this look."
			/>
			<OutfitForm products={productOptionsOf(products)} outfit={outfit} />
			<div className={styles.dangerZone}>
				<DeleteOutfitForm outfitId={outfit.id} />
			</div>
		</div>
	);
}
