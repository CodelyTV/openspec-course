import type { Metadata } from "next";

import { Button } from "@/contexts/frontend/design-system/atoms/Button";
import { retailApi } from "@/contexts/frontend/retail/api/RetailApi";
import { PageHeader } from "@/contexts/frontend/retail/sections/PageHeader";
import { formatOptionalMoney } from "@/contexts/frontend/retail/ui/format";

import { CartSummary } from "./CartSummary";
import { ConfirmOrderForm } from "./ConfirmOrderForm";
import { OrderConfirmation } from "./OrderConfirmation";

import styles from "./page.module.scss";

export const metadata: Metadata = { title: "Checkout" };

type CheckoutPageProps = {
	searchParams: Promise<{ order?: string }>;
};

export default async function CheckoutPage({
	searchParams,
}: CheckoutPageProps): Promise<React.JSX.Element> {
	const { order: placedOrderId } = await searchParams;
	const [checkout, placedOrder] = await Promise.all([
		retailApi.checkoutViewGetter.get(),
		placedOrderId ? retailApi.userOrderFinder.find(placedOrderId) : null,
	]);

	return (
		<main>
			<PageHeader
				eyebrow="Checkout"
				title="Review and confirm your order."
				description="Review your cart, confirm home delivery and place your order."
			/>

			<section className={`container ${styles.layout}`}>
				<div className={styles.main}>
					{placedOrder ? (
						<OrderConfirmation orderId={placedOrder.id} />
					) : null}

					<CartSummary checkout={checkout} />

					<article className={styles.card}>
						<p className="eyebrow">Delivery method</p>
						<h2 className={styles.cardTitle}>How it arrives</h2>
						<div className={styles.delivery}>
							<span
								className={styles.deliveryDot}
								aria-hidden="true"
							/>
							<div>
								<p className={styles.lineName}>Home delivery</p>
								<p className={styles.lineMeta}>
									Standard shipping to your home, with your
									stock already reserved.
								</p>
							</div>
						</div>
					</article>
				</div>

				<aside className={styles.summary}>
					<p className={styles.summaryEyebrow}>Checkout</p>
					<p className={styles.summaryTotal}>
						{formatOptionalMoney(checkout.subtotal)}
					</p>
					<p className={styles.summaryDetail}>
						Order total before shipping. Payment is simulated.
					</p>
					<div className={styles.summaryActions}>
						<ConfirmOrderForm
							isCartEmpty={checkout.lines.length === 0}
						/>
						<Button href="/" mode="inverted">
							Back to catalog
						</Button>
					</div>
				</aside>
			</section>
		</main>
	);
}
