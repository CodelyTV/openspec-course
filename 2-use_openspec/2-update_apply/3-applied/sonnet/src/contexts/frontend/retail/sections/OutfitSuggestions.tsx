import type { OutfitSuggestionResponse } from "@/contexts/backend/products/application/find-suggestions/ProductSuggestionsFinder";

import { ProductGrid } from "./ProductGrid";

import styles from "./OutfitSuggestions.module.scss";

export function OutfitSuggestions({
	outfits,
	currentProductId,
}: {
	outfits: OutfitSuggestionResponse[];
	currentProductId: string;
}): React.JSX.Element {
	return (
		<section className={styles.suggestions}>
			<p className="eyebrow">Complete the look</p>
			{outfits.map((outfit) => (
				<div key={outfit.name} className={styles.outfit}>
					<h2 className={styles.name}>{outfit.name}</h2>
					<ProductGrid
						products={outfit.products}
						currentProductId={currentProductId}
					/>
				</div>
			))}
		</section>
	);
}
