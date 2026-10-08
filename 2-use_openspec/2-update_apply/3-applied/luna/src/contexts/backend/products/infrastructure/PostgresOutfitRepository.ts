import { PostgresRepository } from "@/contexts/backend/shared/infrastructure/PostgresRepository";
import type { ProductId } from "@/contexts/shared/domain/ProductId";

import { OutfitNameAlreadyExistsError } from "../domain/errors/OutfitErrors";
import { Outfit, type OutfitPrimitives } from "../domain/Outfit";
import type { OutfitId } from "../domain/OutfitId";
import { OutfitRepository } from "../domain/OutfitRepository";

type OutfitRow = { id: string; name: string; product_id: string | null };

export class PostgresOutfitRepository
	extends PostgresRepository
	implements OutfitRepository
{
	async save(outfit: Outfit): Promise<void> {
		try {
			await this.transaction(async () => {
				await this
					.sql`insert into outfits (id, name) values (${outfit.id.value}, ${outfit.name}) on conflict (id) do update set name = excluded.name`;
				await this
					.sql`delete from outfit_products where outfit_id = ${outfit.id.value}`;
				if (outfit.productIds.length) {
					await this
						.sql`insert into outfit_products ${this.sql(outfit.productIds.map((productId, position) => ({ outfit_id: outfit.id.value, product_id: productId.value, position })))}`;
				}
			});
		} catch (error) {
			if (
				typeof error === "object" &&
				error !== null &&
				"code" in error &&
				error.code === "23505"
			) {
				throw new OutfitNameAlreadyExistsError(
					"An outfit with that name already exists",
				);
			}
			throw error;
		}
	}

	async search(id: OutfitId): Promise<Outfit | null> {
		return (
			(
				await this.searchRows(
					`select o.id, o.name, op.product_id from outfits o left join outfit_products op on op.outfit_id = o.id where o.id = $1 order by op.position`,
					[id.value],
				)
			)[0] ?? null
		);
	}

	async searchByName(name: string): Promise<Outfit | null> {
		return (
			(
				await this.searchRows(
					`select o.id, o.name, op.product_id from outfits o left join outfit_products op on op.outfit_id = o.id where o.name = $1 order by op.position`,
					[name],
				)
			)[0] ?? null
		);
	}

	async searchAll(): Promise<Outfit[]> {
		return this.searchRows(
			`select o.id, o.name, op.product_id from outfits o left join outfit_products op on op.outfit_id = o.id order by o.name, op.position`,
			[],
		);
	}

	async searchContaining(productId: ProductId): Promise<Outfit[]> {
		return this.searchRows(
			`select o.id, o.name, members.product_id from outfits o join outfit_products membership on membership.outfit_id = o.id join outfit_products members on members.outfit_id = o.id where membership.product_id = $1 order by o.name, members.position`,
			[productId.value],
		);
	}

	async countOutfitsByProduct(): Promise<Map<string, number>> {
		const rows = await this.sql<
			Array<{ product_id: string; count: number }>
		>`select product_id, count(*)::int as count from outfit_products group by product_id`;

		return new Map(rows.map((row) => [row.product_id, row.count]));
	}

	async delete(id: OutfitId): Promise<void> {
		await this.sql`delete from outfits where id = ${id.value}`;
	}

	private async searchRows(
		query: string,
		parameters: string[],
	): Promise<Outfit[]> {
		const rows = await this.sql.unsafe<OutfitRow[]>(query, parameters);
		const grouped = new Map<string, OutfitPrimitives>();
		for (const row of rows) {
			const outfit = grouped.get(row.id) ?? {
				id: row.id,
				name: row.name,
				productIds: [],
			};
			if (row.product_id !== null) {
				outfit.productIds.push(row.product_id);
			}
			grouped.set(row.id, outfit);
		}

		return [...grouped.values()].map(Outfit.fromPrimitives);
	}
}
