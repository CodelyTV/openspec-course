"use client";

import { useFormStatus } from "react-dom";

import { Button, type ButtonProps, type HtmlButtonProps } from "./Button";

export type SubmitButtonProps = ButtonProps &
	Omit<HtmlButtonProps, "type" | "children">;

export function SubmitButton(props: SubmitButtonProps): React.JSX.Element {
	const { pending } = useFormStatus();

	return <Button {...props} type="submit" isLoading={pending} />;
}
