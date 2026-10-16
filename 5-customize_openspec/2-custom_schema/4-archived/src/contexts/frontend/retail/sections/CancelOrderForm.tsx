import { cancelOrder } from "@/app/actions/orders/cancelOrder";
import { SubmitButton } from "@/contexts/frontend/design-system/atoms/SubmitButton";

export function CancelOrderForm({
	orderId,
}: {
	orderId: string;
}): React.JSX.Element {
	return (
		<form action={cancelOrder.bind(null, orderId)}>
			<SubmitButton mode="danger" size="small">
				Cancel order
			</SubmitButton>
		</form>
	);
}
