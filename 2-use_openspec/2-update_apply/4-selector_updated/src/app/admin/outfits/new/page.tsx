import type { Metadata } from "next";
import Link from "next/link";

import { retailContainer } from "@/contexts/backend/shared/infrastructure/RetailContainer";
import { PageHeader } from "@/contexts/frontend/retail/sections/PageHeader";

import { OutfitForm } from "../OutfitForm";
import { productOptionsOf } from "../productOptions";

import styles from "../page.module.scss";

export const metadata: Metadata = { title: "New outfit" };

export default async function NewOutfitPage(): Promise<React.JSX.Element> {
	const products = await retailContainer.productsSearcher.search();

	return (
		<div>
			<Link href="/admin/outfits" className={styles.back}>
				← Back to outfits
			</Link>
			<PageHeader
				size="compact"
				eyebrow="Outfits"
				title="New outfit"
				description="Name the look and choose between 2 and 4 products."
			/>
			<OutfitForm products={productOptionsOf(products)} />
		</div>
	);
}
