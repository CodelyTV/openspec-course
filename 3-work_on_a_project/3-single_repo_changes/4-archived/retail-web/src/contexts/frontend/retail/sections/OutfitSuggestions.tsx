import type { OutfitSuggestionResponse } from "@/contexts/frontend/retail/api/responses";

import { ProductGrid } from "./ProductGrid";

import styles from "./OutfitSuggestions.module.scss";

type OutfitSuggestionsProps = {
	outfits: OutfitSuggestionResponse[];
	currentProductId: string;
};

export function OutfitSuggestions({
	outfits,
	currentProductId,
}: OutfitSuggestionsProps): React.JSX.Element {
	return (
		<section className={styles.section} aria-label="Complete the look">
			<p className="eyebrow">Complete the look</p>
			{outfits.map((outfit) => (
				<article
					key={outfit.name}
					className={styles.outfit}
					aria-label={outfit.name}
				>
					<h2 className={styles.outfitName}>{outfit.name}</h2>
					<ProductGrid
						products={outfit.products}
						currentProductId={currentProductId}
					/>
				</article>
			))}
		</section>
	);
}
