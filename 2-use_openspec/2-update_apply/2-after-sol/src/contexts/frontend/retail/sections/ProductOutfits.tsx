import type { OutfitResponse } from "@/contexts/backend/outfits/application/OutfitResponse";
import type { ProductResponse } from "@/contexts/backend/products/application/ProductResponse";

import { ProductCard } from "./ProductCard";

import styles from "./ProductOutfits.module.scss";

type ProductOutfitsProps = {
	outfits: OutfitResponse[];
	products: ProductResponse[];
	currentProductId: string;
};
export function ProductOutfits({
	outfits,
	products,
	currentProductId,
}: ProductOutfitsProps): React.JSX.Element | null {
	if (outfits.length === 0) {
		return null;
	}
	const byId = new Map(products.map((product) => [product.id, product]));

	return (
		<section className={styles.section} aria-label="Outfit suggestions">
			<p className="eyebrow">Complete the look</p>
			<h2>Outfit suggestions</h2>
			{outfits.map((outfit) => (
				<section
					key={outfit.id}
					aria-label={outfit.name}
					className={styles.outfit}
				>
					<h3>{outfit.name}</h3>
					<div className={styles.grid}>
						{outfit.productIds.map((id) => {
							const product = byId.get(id);

							return product ? (
								<ProductCard
									key={id}
									product={product}
									isCurrent={id === currentProductId}
								/>
							) : null;
						})}
					</div>
				</section>
			))}
		</section>
	);
}
