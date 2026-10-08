import type { OutfitSuggestionResponse } from "@/contexts/backend/products/application/find-suggestions/ProductSuggestionsFinder";

import { ProductCard } from "./ProductCard";

import styles from "./OutfitSuggestions.module.scss";

export function OutfitSuggestions({
	outfits,
	currentProductId,
}: {
	outfits: OutfitSuggestionResponse[];
	currentProductId: string;
}): React.JSX.Element {
	return (
		<section className={styles.section}>
			<p className="eyebrow">Complete the look</p>
			{outfits.map((outfit) => (
				<div key={outfit.name}>
					<h2>{outfit.name}</h2>
					<div className={styles.grid}>
						{outfit.products.map((product) => (
							<ProductCard
								key={product.id}
								product={product}
								viewing={product.id === currentProductId}
							/>
						))}
					</div>
				</div>
			))}
		</section>
	);
}
