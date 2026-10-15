"use client";

import { useId, useState } from "react";

import { Button } from "@/contexts/frontend/design-system/atoms/Button";
import type {
	ProductResponse,
	ProductVariantResponse,
} from "@/contexts/frontend/retail/api/responses";

import { AddToCartForm } from "./AddToCartForm";

import styles from "./ProductPurchasePanel.module.scss";

type ProductPurchasePanelProps = {
	product: ProductResponse;
	initialVariantId?: string;
};

function variantToSelectWhenChoosingColor(
	variants: ProductVariantResponse[],
	color: string,
	currentSize: string,
): ProductVariantResponse | undefined {
	const variantsOfColor = variants.filter(
		(variant) => variant.color === color,
	);

	return (
		variantsOfColor.find(
			(variant) => variant.size === currentSize && variant.hasStock,
		) ??
		variantsOfColor.find((variant) => variant.hasStock) ??
		variantsOfColor[0]
	);
}

function BackToCatalogButton(): React.JSX.Element {
	return (
		<Button href="/" mode="quaternary">
			Back to catalog
		</Button>
	);
}

function ProductWithoutVariants(): React.JSX.Element {
	return (
		<div className={styles.actions}>
			<Button disabled>Sold out</Button>
			<BackToCatalogButton />
		</div>
	);
}

export function ProductPurchasePanel({
	product,
	initialVariantId,
}: ProductPurchasePanelProps): React.JSX.Element {
	const firstVariant = product.variants.at(0);

	if (!firstVariant) {
		return <ProductWithoutVariants />;
	}

	return (
		<VariantPurchasePanel
			product={product}
			firstVariant={firstVariant}
			initialVariantId={
				initialVariantId ??
				product.firstAvailableVariantId ??
				firstVariant.id
			}
		/>
	);
}

function VariantPurchasePanel({
	product,
	firstVariant,
	initialVariantId,
}: {
	product: ProductResponse;
	firstVariant: ProductVariantResponse;
	initialVariantId: string;
}): React.JSX.Element {
	const colorLabelId = useId();
	const sizeLabelId = useId();
	const [selectedVariantId, setSelectedVariantId] =
		useState(initialVariantId);
	const selectedVariant =
		product.variants.find((variant) => variant.id === selectedVariantId) ??
		firstVariant;
	const sizeOptions = product.variants.filter(
		(variant) => variant.color === selectedVariant.color,
	);

	function colorHasStock(color: string): boolean {
		return product.variants.some(
			(variant) => variant.color === color && variant.hasStock,
		);
	}

	function selectColor(color: string): void {
		const nextVariant = variantToSelectWhenChoosingColor(
			product.variants,
			color,
			selectedVariant.size,
		);

		if (nextVariant) {
			setSelectedVariantId(nextVariant.id);
		}
	}

	return (
		<>
			<div className={styles.options}>
				<div>
					<p className={styles.optionLabel} id={colorLabelId}>
						Color:{" "}
						<span className={styles.optionValue}>
							{selectedVariant.color}
						</span>
					</p>
					<div
						className={styles.swatches}
						role="group"
						aria-labelledby={colorLabelId}
					>
						{product.colors.map((color) => {
							const hasStock = colorHasStock(color.name);
							const isSelected =
								color.name === selectedVariant.color;

							return (
								<button
									type="button"
									key={color.name}
									aria-pressed={isSelected}
									aria-label={`${color.name}${hasStock ? "" : ", sold out"}`}
									title={color.name}
									disabled={!hasStock}
									onClick={() => selectColor(color.name)}
									className={`${styles.swatch} ${isSelected ? styles.swatchSelected : ""}`}
									style={{ backgroundColor: color.hex }}
								/>
							);
						})}
					</div>
				</div>

				<div>
					<p className={styles.optionLabel} id={sizeLabelId}>
						Size
					</p>
					<div
						className={styles.sizes}
						role="group"
						aria-labelledby={sizeLabelId}
					>
						{sizeOptions.map((variant) => {
							const isSelected =
								variant.id === selectedVariant.id;

							return (
								<button
									type="button"
									key={variant.id}
									aria-pressed={isSelected}
									aria-label={`Size ${variant.size}${variant.hasStock ? "" : ", sold out"}`}
									disabled={!variant.hasStock}
									onClick={() =>
										setSelectedVariantId(variant.id)
									}
									className={`${styles.choice} ${isSelected ? styles.choiceSelected : ""}`}
								>
									{variant.size}
								</button>
							);
						})}
					</div>
				</div>
			</div>

			<div className={styles.variant}>
				<p className={styles.variantTitle}>Selected variant</p>
				<p className={styles.variantDetail}>
					{selectedVariant.color} / {selectedVariant.size}. Online
					stock: {selectedVariant.onlineStock}
				</p>
				<p className={styles.variantDetail}>
					Measurements: chest {selectedVariant.measurements.chest} cm,
					length {selectedVariant.measurements.length} cm.
				</p>
			</div>

			<div className={styles.actions}>
				<AddToCartForm
					key={selectedVariant.id}
					variantId={selectedVariant.id}
					hasStock={selectedVariant.hasStock}
				/>
				<BackToCatalogButton />
			</div>
		</>
	);
}
