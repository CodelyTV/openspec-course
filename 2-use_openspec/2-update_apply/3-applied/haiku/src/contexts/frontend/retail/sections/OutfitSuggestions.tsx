import type { OutfitSuggestionResponse } from "@/contexts/backend/products/application/find-suggestions/ProductSuggestionsFinder";

import { ProductCard } from "./ProductCard";

import styles from "./OutfitSuggestions.module.scss";

export function OutfitSuggestions({
	outfits,
	viewedProductId,
}: {
	outfits: OutfitSuggestionResponse[];
	viewedProductId: string;
}): React.JSX.Element {
	return (
		<>
			<p className="eyebrow">Complete the look</p>
			<h2 className={styles.heading}>Outfits with this piece</h2>
			<div className={styles.outfits}>
				{outfits.map((outfit) => (
					<div key={outfit.name}>
						<h3 className={styles.name}>{outfit.name}</h3>
						<div className={styles.pieces}>
							{outfit.products.map((product) => (
								<ProductCard
									key={product.id}
									product={product}
									isViewing={product.id === viewedProductId}
								/>
							))}
						</div>
					</div>
				))}
			</div>
		</>
	);
}
