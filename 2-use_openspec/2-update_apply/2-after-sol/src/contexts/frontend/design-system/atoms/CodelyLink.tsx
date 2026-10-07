import NextLink from "next/link";
import React from "react";

export type CodelyLinkProps = React.ComponentProps<typeof NextLink> & {
	component?: React.ElementType;
};

export const CodelyLink: React.FC<CodelyLinkProps> = ({
	component: LinkComponent = NextLink,
	onClick,
	target,
	rel,
	...props
}) => {
	const defaultRel =
		target === "_blank" && !rel ? "noopener noreferrer" : rel;
	const finalProps = { ...props, target, rel: defaultRel };

	return <LinkComponent {...finalProps} onClick={onClick} />;
};
