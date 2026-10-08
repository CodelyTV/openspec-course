import styles from "./FormError.module.scss";

export function FormError({
	message,
}: {
	message: string | null;
}): React.JSX.Element | null {
	if (message === null) {
		return null;
	}

	return (
		<p role="alert" className={styles.error}>
			{message}
		</p>
	);
}
