import Image from "next/image";

import { productImageSrc } from "../ui/productImage";

import styles from "./ProductThumbnail.module.scss";

type ProductThumbnailProps = {
	product: { id: string; name: string };
	size?: number;
	isDecorative?: boolean;
};

const defaultSizeInPixels = 40;
const altOfDecorativeImage = "";

export function ProductThumbnail({
	product,
	size = defaultSizeInPixels,
	isDecorative = false,
}: ProductThumbnailProps): React.JSX.Element {
	return (
		<Image
			src={productImageSrc(product.id)}
			alt={isDecorative ? altOfDecorativeImage : product.name}
			width={size}
			height={size}
			className={styles.thumbnail}
		/>
	);
}
