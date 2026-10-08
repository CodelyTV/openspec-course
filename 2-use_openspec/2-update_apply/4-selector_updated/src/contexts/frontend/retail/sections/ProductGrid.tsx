import type { ProductResponse } from "@/contexts/backend/products/application/ProductResponse";

import { ProductCard } from "./ProductCard";

import styles from "./ProductGrid.module.scss";

type ProductGridProps = {
	products: ProductResponse[];
	emptyMessage?: string;
	prioritizeFirstImage?: boolean;
	currentProductId?: string;
};

export function ProductGrid({
	products,
	emptyMessage = "There are no products here yet.",
	prioritizeFirstImage = false,
	currentProductId,
}: ProductGridProps): React.JSX.Element {
	if (products.length === 0) {
		return <p className={styles.empty}>{emptyMessage}</p>;
	}

	return (
		<div className={styles.grid}>
			{products.map((product, index) => (
				<ProductCard
					key={product.id}
					product={product}
					priority={prioritizeFirstImage && index === 0}
					isBeingViewed={product.id === currentProductId}
				/>
			))}
		</div>
	);
}
