import type { ProductResponse } from "@/contexts/backend/products/application/ProductResponse";
import { Button } from "@/contexts/frontend/design-system/atoms/Button";

import { ProductGrid } from "./ProductGrid";

import styles from "./CustomerWishlist.module.scss";

export function CustomerWishlist({
	products,
}: {
	products: ProductResponse[];
}): React.JSX.Element {
	if (products.length === 0) {
		return (
			<div className={styles.empty}>
				<p>Your wishlist is empty.</p>
				<Button href="/" mode="quaternary">
					Browse the catalog
				</Button>
			</div>
		);
	}

	return <ProductGrid products={products} />;
}
