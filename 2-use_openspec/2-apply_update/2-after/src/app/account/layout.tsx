import type { ReactNode } from "react";

import styles from "./layout.module.scss";

export default function AccountLayout({
	children,
}: {
	children: ReactNode;
}): React.JSX.Element {
	return (
		<main className={`container ${styles.layout}`}>
			<p className="eyebrow">My account</p>
			{children}
		</main>
	);
}
