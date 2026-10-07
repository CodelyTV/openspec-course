import type { ReactNode } from "react";

import { classNames } from "../shared/classNames";

import styles from "./Table.module.scss";

export type TableColumn<Row> = {
	header: string;
	cell: (row: Row) => ReactNode;
	align?: "start" | "end";
};

export type TableProps<Row> = {
	label: string;
	columns: TableColumn<Row>[];
	rows: Row[];
	rowKey: (row: Row) => string;
	isRowHighlighted?: (row: Row) => boolean;
};

function neverHighlighted(): boolean {
	return false;
}

export function Table<Row>({
	label,
	columns,
	rows,
	rowKey,
	isRowHighlighted = neverHighlighted,
}: TableProps<Row>): React.JSX.Element {
	function alignmentOf(column: TableColumn<Row>): string | undefined {
		return column.align === "end" ? styles.alignEnd : undefined;
	}

	return (
		<div className={styles.wrapper}>
			<table className={styles.table} aria-label={label}>
				<thead>
					<tr>
						{columns.map((column) => (
							<th
								key={column.header}
								scope="col"
								className={alignmentOf(column)}
							>
								{column.header}
							</th>
						))}
					</tr>
				</thead>
				<tbody>
					{rows.map((row) => (
						<tr
							key={rowKey(row)}
							className={classNames({
								[styles.highlighted]: isRowHighlighted(row),
							})}
						>
							{columns.map((column) => (
								<td
									key={column.header}
									className={alignmentOf(column)}
								>
									{column.cell(row)}
								</td>
							))}
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}
