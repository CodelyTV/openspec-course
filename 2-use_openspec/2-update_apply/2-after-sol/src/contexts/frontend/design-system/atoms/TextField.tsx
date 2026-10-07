import type { InputHTMLAttributes } from "react";

import styles from "./fields.module.scss";

type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & {
	label: string;
	id: string;
};
export function TextField({
	label,
	id,
	...props
}: TextFieldProps): React.JSX.Element {
	return (
		<div className={styles.field}>
			<label htmlFor={id}>{label}</label>
			<input {...props} id={id} className={styles.input} />
		</div>
	);
}
