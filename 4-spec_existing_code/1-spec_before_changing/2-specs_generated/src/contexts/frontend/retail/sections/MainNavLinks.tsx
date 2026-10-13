"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

import { classNames } from "@/contexts/frontend/design-system/shared/classNames";

import styles from "./MainNav.module.scss";

export function MainNavLinks({
	collections,
}: {
	collections: string[];
}): React.JSX.Element {
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const selectedCollection = searchParams.get("collection");
	const onCatalog = pathname === "/";

	const items = [
		{
			label: "Catalog",
			href: "/",
			active: onCatalog && !selectedCollection,
		},
		...collections.map((collection) => ({
			label: collection,
			href: `/?collection=${encodeURIComponent(collection)}`,
			active: onCatalog && selectedCollection === collection,
		})),
	];

	return (
		<nav className={styles.nav} aria-label="Collections">
			{items.map((item) => (
				<Link
					key={item.href}
					href={item.href}
					data-label={item.label}
					aria-current={item.active ? "page" : undefined}
					className={classNames(styles.link, {
						[styles.active]: item.active,
					})}
				>
					{item.label}
				</Link>
			))}
		</nav>
	);
}
