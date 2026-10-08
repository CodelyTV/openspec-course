"use client";

import { Button } from "@/contexts/frontend/design-system/atoms/Button";

import styles from "./status.module.scss";

export default function ErrorBoundary({
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}): React.JSX.Element {
	return (
		<main className={`container ${styles.status}`}>
			<p className="eyebrow">Something went wrong</p>
			<h1 className={styles.title}>This view could not be loaded</h1>
			<p className={styles.detail}>
				An unexpected error occurred. Please try again.
			</p>
			<div className={styles.actions}>
				<Button onClick={reset}>Retry</Button>
				<Button href="/" mode="quaternary">
					Back to catalog
				</Button>
			</div>
		</main>
	);
}
