import Link from "next/link";

import { classNames } from "@/contexts/frontend/design-system/shared/classNames";

import styles from "./CategoryFilters.module.scss";

type CategoryFiltersProps = {
	categories: string[];
	selectedCollection?: string;
	selectedCategory?: string;
};

function catalogHref(collection?: string, category?: string): string {
	const params = new URLSearchParams();

	if (collection) {
		params.set("collection", collection);
	}

	if (category) {
		params.set("category", category);
	}

	const query = params.toString();

	return query ? `/?${query}` : "/";
}

export function CategoryFilters({
	categories,
	selectedCollection,
	selectedCategory,
}: CategoryFiltersProps): React.JSX.Element {
	const filters = [
		{ label: "All", category: undefined },
		...categories.map((category) => ({ label: category, category })),
	];

	return (
		<nav className={styles.filters} aria-label="Filter by garment type">
			{filters.map((filter) => {
				const isActive = filter.category === selectedCategory;

				return (
					<Link
						key={filter.label}
						href={catalogHref(selectedCollection, filter.category)}
						aria-current={isActive ? "page" : undefined}
						className={classNames(styles.filter, {
							[styles.filterActive]: isActive,
						})}
					>
						{filter.label}
					</Link>
				);
			})}
		</nav>
	);
}
