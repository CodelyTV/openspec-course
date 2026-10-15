import { retailApi } from "@/contexts/frontend/retail/api/RetailApi";
import { CatalogSummary } from "@/contexts/frontend/retail/sections/CatalogSummary";
import { CategoryFilters } from "@/contexts/frontend/retail/sections/CategoryFilters";
import { PageHeader } from "@/contexts/frontend/retail/sections/PageHeader";
import { ProductGrid } from "@/contexts/frontend/retail/sections/ProductGrid";

import styles from "./page.module.scss";

type CatalogPageProps = {
	searchParams: Promise<{ collection?: string; category?: string }>;
};

export default async function CatalogPage({
	searchParams,
}: CatalogPageProps): Promise<React.JSX.Element> {
	const { collection, category } = await searchParams;
	const [products, categories] = await Promise.all([
		retailApi.productsSearcher.search({ collection, category }),
		retailApi.categoriesLister.list(),
	]);

	return (
		<main>
			<PageHeader
				showUnderscore
				eyebrow={collection ? "Collection" : "Codely Atelier"}
				title={collection ?? "Clean code, pro style"}
				description={
					collection
						? `All the best of the ${collection} collection, with no technical debt.`
						: "Production-ready garments, with no legacy seams. Pick a color and size, and we deploy straight to your wardrobe."
				}
				aside={<CatalogSummary products={products} />}
			/>

			<section className={`container ${styles.section}`}>
				<div className={styles.toolbar}>
					<div>
						<p className="eyebrow">Catalog</p>
						<h2 className={styles.heading}>
							Explore the collection
						</h2>
					</div>
					<CategoryFilters
						categories={categories}
						selectedCollection={collection}
						selectedCategory={category}
					/>
				</div>

				<ProductGrid
					products={products}
					emptyMessage="There are no products in this collection yet."
					prioritizeFirstImage
				/>
			</section>
		</main>
	);
}
