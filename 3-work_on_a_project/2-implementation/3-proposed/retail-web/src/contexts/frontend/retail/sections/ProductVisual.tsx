import Image from "next/image";

import type { ProductResponse } from "@/contexts/frontend/retail/api/responses";

import { productImageSrc } from "../ui/productImage";

import styles from "./ProductVisual.module.scss";

type ProductVisualProps = {
	product: Pick<ProductResponse, "id" | "accent" | "name" | "collection">;
	size?: "card" | "hero";
	priority?: boolean;
	titleAs?: "p" | "h2";
};

export function ProductVisual({
	product,
	size = "card",
	priority = false,
	titleAs = "p",
}: ProductVisualProps): React.JSX.Element {
	const Title = titleAs;

	return (
		<div
			className={`${styles.visual} ${styles[size]} ${styles[`accent-${product.accent}`]}`}
		>
			<Image
				src={productImageSrc(product.id)}
				alt={product.name}
				fill
				priority={priority}
				sizes={
					size === "hero"
						? "(min-width: 860px) 55vw, 100vw"
						: "(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
				}
				className={styles.image}
			/>
			<div className={styles.caption}>
				<p className={styles.collection}>{product.collection}</p>
				<Title className={styles.name}>{product.name}</Title>
			</div>
		</div>
	);
}
