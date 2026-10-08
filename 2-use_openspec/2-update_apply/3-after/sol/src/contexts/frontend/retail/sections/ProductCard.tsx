import Link from "next/link";

import type { ProductResponse } from "@/contexts/backend/products/application/ProductResponse";

import { formatMoney } from "../ui/format";

import { ProductBadges } from "./ProductBadges";
import { ProductVisual } from "./ProductVisual";

import styles from "./ProductCard.module.scss";

type ProductCardProps = {
	product: ProductResponse;
	priority?: boolean;
	viewing?: boolean;
};

export function ProductCard({
	product,
	priority = false,
	viewing = false,
}: ProductCardProps): React.JSX.Element {
	const isSoldOut = product.totalOnlineStock === 0;

	const content = (
		<>
			<div className={styles.media}>
				<ProductVisual
					product={product}
					titleAs="h2"
					priority={priority}
				/>
				<ProductBadges
					badges={product.badges}
					className={styles.badges}
				/>
			</div>
			<div className={styles.body}>
				{viewing ? <p>Viewing</p> : null}
				<div>
					<p className={styles.category}>{product.category}</p>
					<p className={styles.description}>{product.description}</p>
				</div>
				{product.colors.length > 0 ? (
					<div
						className={styles.swatches}
						role="img"
						aria-label={`${product.colors.length} colors: ${product.colors.map((color) => color.name).join(", ")}`}
					>
						{product.colors.slice(0, 4).map((color) => (
							<span
								key={color.name}
								className={styles.swatch}
								style={{ backgroundColor: color.hex }}
								title={color.name}
							/>
						))}
						{product.colors.length > 4 ? (
							<span className={styles.swatchMore}>
								+{product.colors.length - 4}
							</span>
						) : null}
					</div>
				) : null}
				<div className={styles.footer}>
					<p className={styles.price}>{formatMoney(product.price)}</p>
					<p className={styles.stock}>
						{isSoldOut
							? "Sold out"
							: `${product.totalOnlineStock} in stock`}
					</p>
				</div>
			</div>
		</>
	);

	return (
		<article className={styles.card}>
			{viewing ? (
				<div className={styles.link}>{content}</div>
			) : (
				<Link href={`/products/${product.id}`} className={styles.link}>
					{content}
				</Link>
			)}
		</article>
	);
}
