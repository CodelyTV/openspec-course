import { classNames } from "@/contexts/frontend/design-system/shared/classNames";

import { formatStatus } from "../ui/format";

import styles from "./orders.module.scss";

export function OrderStatusPill({
	status,
}: {
	status: string;
}): React.JSX.Element {
	return (
		<span
			className={classNames(styles.status, {
				[styles["status--cancelled"]]: status === "cancelled",
			})}
		>
			{formatStatus(status)}
		</span>
	);
}
