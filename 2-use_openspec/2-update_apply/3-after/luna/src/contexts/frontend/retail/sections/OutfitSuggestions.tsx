import Link from "next/link";

import type { OutfitSuggestionResponse } from "@/contexts/backend/products/application/find-suggestions/ProductSuggestionsFinder";
import type { ProductResponse } from "@/contexts/backend/products/application/ProductResponse";

import { ProductVisual } from "./ProductVisual";

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
				<div key={outfit.name} className={styles.outfit}>
					<h2>{outfit.name}</h2>
					<div className={styles.products}>
						{outfit.products.map((product) => (
							<SuggestionPiece
								key={product.id}
								product={product}
								current={product.id === currentProductId}
							/>
						))}
					</div>
				</div>
			))}
		</section>
	);
}

function SuggestionPiece({
	product,
	current,
}: {
	product: ProductResponse;
	current: boolean;
}): React.JSX.Element {
	const content = (
		<>
			<ProductVisual product={product} titleAs="h2" />
			{current ? <span>Viewing</span> : null}
		</>
	);

	return current ? (
		<article className={styles.piece}>{content}</article>
	) : (
		<article className={styles.piece}>
			<Link href={`/products/${product.id}`}>{content}</Link>
		</article>
	);
}
