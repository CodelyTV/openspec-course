import { PostgresRepository } from "@/contexts/backend/shared/infrastructure/PostgresRepository";
import type { UserId } from "@/contexts/backend/users/domain/UserId";
import { parseDeliveryMethod } from "@/contexts/shared/domain/DeliveryMethod";

import { Checkout, parseCheckoutStatus } from "../domain/Checkout";
import type { CheckoutRepository } from "../domain/CheckoutRepository";
import { CheckoutConcurrentModificationError } from "../domain/errors/CheckoutConcurrentModificationError";

type CheckoutRow = {
	id: string;
	user_id: string;
	delivery_method: string;
	status: string;
	version: number;
};

type CheckoutLineRow = {
	product_id: string;
	variant_id: string;
	quantity: number;
};

const firstPersistedVersion = 1;

export class PostgresCheckoutRepository
	extends PostgresRepository
	implements CheckoutRepository
{
	async save(checkout: Checkout): Promise<void> {
		await this.transaction(async () => {
			const savedRows = checkout.hasNeverBeenPersisted()
				? await this.insert(checkout)
				: await this.updateIfUnchangedSinceRead(checkout);

			if (savedRows === 0) {
				throw new CheckoutConcurrentModificationError(checkout.id);
			}

			await this.replaceLines(checkout);
		});
	}

	async searchByUser(userId: UserId): Promise<Checkout | null> {
		return this.searchOwnedBy(userId, { lockUntilTransactionEnds: false });
	}

	async searchByUserLockingIt(userId: UserId): Promise<Checkout | null> {
		return this.searchOwnedBy(userId, { lockUntilTransactionEnds: true });
	}

	private async insert(checkout: Checkout): Promise<number> {
		const primitives = checkout.toPrimitives();

		const result = await this.sql`
			insert into checkouts (id, user_id, delivery_method, status, version)
			values (
				${primitives.id},
				${primitives.userId},
				${primitives.deliveryMethod},
				${primitives.status},
				${firstPersistedVersion}
			)
			on conflict do nothing
		`;

		return result.count;
	}

	private async updateIfUnchangedSinceRead(
		checkout: Checkout,
	): Promise<number> {
		const primitives = checkout.toPrimitives();

		const result = await this.sql`
			update checkouts set
				delivery_method = ${primitives.deliveryMethod},
				status = ${primitives.status},
				version = version + 1
			where id = ${primitives.id} and version = ${primitives.version}
		`;

		return result.count;
	}

	private async replaceLines(checkout: Checkout): Promise<void> {
		const primitives = checkout.toPrimitives();
		const sql = this.sql;

		await sql`delete from checkout_lines where checkout_id = ${primitives.id}`;

		if (primitives.lines.length > 0) {
			await sql`
				insert into checkout_lines ${sql(
					primitives.lines.map((line) => ({
						checkout_id: primitives.id,
						product_id: line.productId,
						variant_id: line.variantId,
						quantity: line.quantity,
					})),
					"checkout_id",
					"product_id",
					"variant_id",
					"quantity",
				)}
			`;
		}
	}

	private async searchOwnedBy(
		userId: UserId,
		{ lockUntilTransactionEnds }: { lockUntilTransactionEnds: boolean },
	): Promise<Checkout | null> {
		const sql = this.sql;
		const checkout = (
			await sql<CheckoutRow[]>`
				select id, user_id, delivery_method, status, version
				from checkouts
				where user_id = ${userId.value}
				${lockUntilTransactionEnds ? sql`for update` : sql``}
			`
		).at(0);

		if (!checkout) {
			return null;
		}

		const lineRows = await sql<CheckoutLineRow[]>`
			select product_id, variant_id, quantity
			from checkout_lines
			where checkout_id = ${checkout.id}
			order by product_id, variant_id
		`;

		return Checkout.fromPrimitives({
			id: checkout.id,
			userId: checkout.user_id,
			deliveryMethod: parseDeliveryMethod(checkout.delivery_method),
			status: parseCheckoutStatus(checkout.status),
			version: checkout.version,
			lines: lineRows.map((line) => ({
				productId: line.product_id,
				variantId: line.variant_id,
				quantity: line.quantity,
			})),
		});
	}
}
