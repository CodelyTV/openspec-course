import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";

import { retailContainer } from "@/contexts/backend/shared/infrastructure/RetailContainer";
import { OutfitSuggestions } from "@/contexts/frontend/retail/sections/OutfitSuggestions";
import { ProductBadges } from "@/contexts/frontend/retail/sections/ProductBadges";
import { ProductGrid } from "@/contexts/frontend/retail/sections/ProductGrid";
import { ProductInfo } from "@/contexts/frontend/retail/sections/ProductInfo";
import { ProductVisual } from "@/contexts/frontend/retail/sections/ProductVisual";
import { formatMoney } from "@/contexts/frontend/retail/ui/format";

import { ProductPurchasePanel } from "./ProductPurchasePanel";

import styles from "./page.module.scss";

type ProductPageProps = {
	params: Promise<{ id: string }>;
};

const findProduct = cache((id: string) =>
	retailContainer.productFinder.find(id),
);

export async function generateMetadata({
	params,
}: ProductPageProps): Promise<Metadata> {
	const product = await findProduct((await params).id);

	return product
		? { title: product.name, description: product.description }
		: {};
}

export default async function ProductPage({
	params,
}: ProductPageProps): Promise<React.JSX.Element> {
	const { id } = await params;
	const product = await findProduct(id);

	if (!product) {
		notFound();
	}

	const suggestions = await retailContainer.productSuggestionsFinder.find(
		product.id,
	);

	return (
		<main className={`container ${styles.main}`}>
			<div className="page-grid">
				<div className={styles.media}>
					<ProductVisual product={product} size="hero" priority />
					<ProductInfo sizeGuide={product.sizeGuide} />
				</div>

				<section className={styles.details}>
					<p className="eyebrow">{product.collection}</p>
					<h1 className={styles.name}>{product.name}</h1>
					<p className={styles.description}>{product.description}</p>

					<ProductBadges
						badges={product.badges}
						className={styles.badges}
					/>

					<p className={styles.price}>{formatMoney(product.price)}</p>

					<ProductPurchasePanel product={product} />
				</section>
			</div>

			{suggestions.kind === "outfits" ? (
				<OutfitSuggestions
					outfits={suggestions.outfits}
					currentProductId={product.id}
				/>
			) : null}
			{suggestions.kind === "collection" &&
			suggestions.products.length > 0 ? (
				<section className={styles.related}>
					<p className="eyebrow">Collection</p>
					<h2 className={styles.sectionHeading}>
						You might also like
					</h2>
					<ProductGrid products={suggestions.products} />
				</section>
			) : null}
		</main>
	);
}
