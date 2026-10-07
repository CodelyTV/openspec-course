import {
	Badge,
	type BadgeColor,
} from "@/contexts/frontend/design-system/atoms/Badge";

const colorByBadge: Record<string, BadgeColor> = {
	New: "alt-1",
	"Low stock": "alt-3",
	"Limited edition": "alt-4",
};

export function ProductBadges({
	badges,
	className,
}: {
	badges: string[];
	className?: string;
}): React.JSX.Element | null {
	if (badges.length === 0) {
		return null;
	}

	return (
		<div className={className}>
			{badges.map((badge) => (
				<Badge key={badge} color={colorByBadge[badge] ?? "neutral"}>
					{badge}
				</Badge>
			))}
		</div>
	);
}
