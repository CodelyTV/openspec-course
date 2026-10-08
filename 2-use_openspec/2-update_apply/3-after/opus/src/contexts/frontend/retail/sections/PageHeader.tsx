import type { ReactNode } from "react";

import { Heading } from "@/contexts/frontend/design-system/atoms/Heading";

import styles from "./PageHeader.module.scss";

type PageHeaderProps = {
	title: string;
	eyebrow?: string;
	description?: ReactNode;
	aside?: ReactNode;
	showUnderscore?: boolean;
	size?: "hero" | "compact";
};

export function PageHeader({
	title,
	eyebrow,
	description,
	aside,
	showUnderscore = false,
	size = "hero",
}: PageHeaderProps): React.JSX.Element {
	if (size === "compact") {
		return (
			<header className={styles.compact}>
				{eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
				<h1 className={styles.compactTitle}>{title}</h1>
				{description ? (
					<p className={styles.compactDescription}>{description}</p>
				) : null}
			</header>
		);
	}

	return (
		<section className={`container ${styles.header}`}>
			<div className={styles.intro}>
				{eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
				<Heading
					level="h1"
					size="large"
					showUnderscore={showUnderscore}
				>
					{title}
				</Heading>
				{description ? (
					<p className={styles.description}>{description}</p>
				) : null}
			</div>
			{aside ? <div className={styles.aside}>{aside}</div> : null}
		</section>
	);
}
