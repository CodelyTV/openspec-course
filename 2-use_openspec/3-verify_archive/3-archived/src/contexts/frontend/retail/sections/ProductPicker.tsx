"use client";

import { useId, useRef, useState } from "react";

import { classNames } from "@/contexts/frontend/design-system/shared/classNames";

import { ProductThumbnail } from "./ProductThumbnail";

import styles from "./ProductPicker.module.scss";

export type ProductPickerOption = { id: string; name: string };

type ProductPickerProps = {
	label: string;
	name: string;
	products: ProductPickerOption[];
	chosenProductId: string;
	unavailableProductIds: string[];
	onChoose: (productId: string) => void;
	required?: boolean;
};

const noProduct = "";
const noActiveOption = -1;

function productsMatching(
	products: ProductPickerOption[],
	query: string,
): ProductPickerOption[] {
	const normalizedQuery = query.trim().toLowerCase();

	return products.filter((product) =>
		product.name.toLowerCase().includes(normalizedQuery),
	);
}

export function ProductPicker({
	label,
	name,
	products,
	chosenProductId,
	unavailableProductIds,
	onChoose,
	required = false,
}: ProductPickerProps): React.JSX.Element {
	const id = useId();
	const labelId = `${id}-label`;
	const searchId = `${id}-search`;
	const listboxId = `${id}-listbox`;
	const optionIdAt = (index: number): string => `${id}-option-${index}`;

	const [query, setQuery] = useState("");
	const [isOpen, setIsOpen] = useState(false);
	const [activeIndex, setActiveIndex] = useState(noActiveOption);
	const shouldFocusSearchWhenShown = useRef(false);

	const chosenProduct = products.find(
		(product) => product.id === chosenProductId,
	);
	const matchingProducts = productsMatching(products, query);
	const isUnavailable = (product: ProductPickerOption): boolean =>
		unavailableProductIds.includes(product.id);

	function nextAvailableIndex(from: number, step: 1 | -1): number {
		for (
			let index = from + step;
			index >= 0 && index < matchingProducts.length;
			index += step
		) {
			if (!isUnavailable(matchingProducts[index])) {
				return index;
			}
		}

		return from;
	}

	function firstAvailableIndexOf(candidates: ProductPickerOption[]): number {
		return candidates.findIndex(
			(product) => !unavailableProductIds.includes(product.id),
		);
	}

	function open(): void {
		setIsOpen(true);
		setActiveIndex(firstAvailableIndexOf(matchingProducts));
	}

	function close(): void {
		setIsOpen(false);
		setActiveIndex(noActiveOption);
	}

	function search(text: string): void {
		setQuery(text);
		setIsOpen(true);
		setActiveIndex(firstAvailableIndexOf(productsMatching(products, text)));
	}

	function choose(product: ProductPickerOption): void {
		if (isUnavailable(product)) {
			return;
		}
		onChoose(product.id);
		setQuery("");
		close();
	}

	function remove(): void {
		shouldFocusSearchWhenShown.current = true;
		onChoose(noProduct);
	}

	function focusSearchAfterRemoving(input: HTMLInputElement | null): void {
		if (input && shouldFocusSearchWhenShown.current) {
			shouldFocusSearchWhenShown.current = false;
			input.focus();
		}
	}

	function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>): void {
		switch (event.key) {
			case "ArrowDown":
				event.preventDefault();
				if (isOpen) {
					setActiveIndex((current) => nextAvailableIndex(current, 1));
				} else {
					open();
				}
				break;
			case "ArrowUp":
				event.preventDefault();
				setActiveIndex((current) => nextAvailableIndex(current, -1));
				break;
			case "Enter":
				if (isOpen) {
					event.preventDefault();
					const activeProduct = matchingProducts.at(activeIndex);
					if (activeIndex !== noActiveOption && activeProduct) {
						choose(activeProduct);
					}
				}
				break;
			case "Escape":
				if (isOpen) {
					event.preventDefault();
					close();
				}
				break;
		}
	}

	const hasActiveOption = isOpen && activeIndex !== noActiveOption;

	return (
		<div role="group" aria-labelledby={labelId} className={styles.picker}>
			<label id={labelId} htmlFor={searchId} className={styles.label}>
				{label}
			</label>
			<input type="hidden" name={name} value={chosenProductId} />

			{chosenProduct ? (
				<div className={styles.chosen}>
					<ProductThumbnail product={chosenProduct} />
					<span className={styles.chosenName}>
						{chosenProduct.name}
					</span>
					<button
						type="button"
						className={styles.remove}
						onClick={remove}
						aria-label={`Remove ${chosenProduct.name}`}
					>
						Remove
					</button>
				</div>
			) : (
				<div className={styles.search}>
					<input
						ref={focusSearchAfterRemoving}
						id={searchId}
						type="text"
						role="combobox"
						className={styles.input}
						placeholder="Search a product by name"
						autoComplete="off"
						aria-autocomplete="list"
						aria-expanded={isOpen}
						aria-controls={listboxId}
						aria-activedescendant={
							hasActiveOption
								? optionIdAt(activeIndex)
								: undefined
						}
						value={query}
						onChange={(event) => search(event.target.value)}
						onKeyDown={handleKeyDown}
						onBlur={close}
						required={required}
					/>
					{isOpen ? (
						<div className={styles.popup}>
							{matchingProducts.length > 0 ? (
								<ul
									id={listboxId}
									role="listbox"
									aria-label={label}
									className={styles.listbox}
								>
									{matchingProducts.map((product, index) => {
										const isProductUnavailable =
											isUnavailable(product);

										return (
											<li
												key={product.id}
												id={optionIdAt(index)}
												role="option"
												aria-selected={
													index === activeIndex
												}
												aria-disabled={
													isProductUnavailable ||
													undefined
												}
												className={classNames(
													styles.option,
													{
														[styles.active]:
															index ===
															activeIndex,
														[styles.unavailable]:
															isProductUnavailable,
													},
												)}
												onMouseDown={(event) =>
													event.preventDefault()
												}
												onClick={() => choose(product)}
											>
												<ProductThumbnail
													product={product}
													isDecorative
												/>
												<span
													className={
														styles.optionName
													}
												>
													{product.name}
												</span>
												{isProductUnavailable ? (
													<span
														className={styles.note}
													>
														Already in this outfit
													</span>
												) : null}
											</li>
										);
									})}
								</ul>
							) : (
								<p className={styles.noMatch} role="status">
									No products match
								</p>
							)}
						</div>
					) : null}
				</div>
			)}
		</div>
	);
}
