import type { SelectHTMLAttributes } from "react";

import styles from "./fields.module.scss";

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
	label: string;
	id: string;
	options: { value: string; label: string }[];
};
export function Select({
	label,
	id,
	options,
	...props
}: SelectProps): React.JSX.Element {
	return (
		<div className={styles.field}>
			<label htmlFor={id}>{label}</label>
			<select {...props} id={id} className={styles.input}>
				{options.map((option) => (
					<option key={option.value} value={option.value}>
						{option.label}
					</option>
				))}
			</select>
		</div>
	);
}
