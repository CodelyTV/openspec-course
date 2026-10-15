import postgres from "postgres";

import { PostgresRepository } from "@/contexts/backend/shared/infrastructure/PostgresRepository";
import type { ProductId } from "@/contexts/shared/domain/ProductId";

import { OutfitNameAlreadyExistsError } from "../domain/errors/OutfitNameAlreadyExistsError";
import { Outfit } from "../domain/Outfit";
import type { OutfitId } from "../domain/OutfitId";
import type {
	OutfitCountByProductId,
	OutfitRepository,
} from "../domain/OutfitRepository";

type OutfitRow = {
	id: string;
	name: string;
	product_ids: string[];
};

const uniqueViolationCode = "23505";
const uniqueOutfitNameConstraint = "outfits_name_case_insensitive_key";

function isOutfitNameAlreadyTaken(error: unknown): boolean {
	return (
		error instanceof postgres.PostgresError &&
		error.code === uniqueViolationCode &&
		error.constraint_name === uniqueOutfitNameConstraint
	);
}

export class PostgresOutfitRepository
	extends PostgresRepository
	implements OutfitRepository
{
	async save(outfit: Outfit): Promise<void> {
		try {
			await this.transaction(async () => {
				await this.upsertOutfit(outfit);
				await this.replaceProducts(outfit);
			});
		} catch (error) {
			if (isOutfitNameAlreadyTaken(error)) {
				throw new OutfitNameAlreadyExistsError(outfit.name);
			}

			throw error;
		}
	}

	async search(id: OutfitId): Promise<Outfit | null> {
		const sql = this.sql;

		return (
			(await this.searchWhere(sql`outfits.id = ${id.value}`)).at(0) ??
			null
		);
	}

	async searchByName(name: string): Promise<Outfit | null> {
		const sql = this.sql;

		return (
			(
				await this.searchWhere(
					sql`lower(outfits.name) = lower(${name})`,
				)
			).at(0) ?? null
		);
	}

	async searchAll(): Promise<Outfit[]> {
		const sql = this.sql;

		return this.searchWhere(sql`true`);
	}

	async searchContaining(productId: ProductId): Promise<Outfit[]> {
		const sql = this.sql;

		return this.searchWhere(sql`outfits.id in (
			select outfit_id
			from outfit_products
			where product_id = ${productId.value}
		)`);
	}

	async countOutfitsByProduct(): Promise<OutfitCountByProductId> {
		const rows = await this.sql<
			Array<{ product_id: string; outfit_count: number }>
		>`
			select product_id, count(*)::integer as outfit_count
			from outfit_products
			group by product_id
		`;

		return new Map(rows.map((row) => [row.product_id, row.outfit_count]));
	}

	async delete(id: OutfitId): Promise<void> {
		await this.sql`delete from outfits where id = ${id.value}`;
	}

	private async upsertOutfit(outfit: Outfit): Promise<void> {
		await this.sql`
			insert into outfits (id, name)
			values (${outfit.id.value}, ${outfit.name})
			on conflict (id) do update set name = excluded.name
		`;
	}

	private async replaceProducts(outfit: Outfit): Promise<void> {
		const sql = this.sql;

		await sql`delete from outfit_products where outfit_id = ${outfit.id.value}`;

		await sql`
			insert into outfit_products ${sql(
				outfit.productIds.map((productId, position) => ({
					outfit_id: outfit.id.value,
					product_id: productId.value,
					position,
				})),
				"outfit_id",
				"product_id",
				"position",
			)}
		`;
	}

	private async searchWhere(
		condition: postgres.PendingQuery<postgres.Row[]>,
	): Promise<Outfit[]> {
		const rows = await this.sql<OutfitRow[]>`
			select
				outfits.id,
				outfits.name,
				coalesce(
					array_agg(outfit_products.product_id order by outfit_products.position)
						filter (where outfit_products.product_id is not null),
					'{}'
				) as product_ids
			from outfits
			left join outfit_products on outfit_products.outfit_id = outfits.id
			where ${condition}
			group by outfits.id, outfits.name
			order by outfits.name
		`;

		return rows.map((row) =>
			Outfit.fromPrimitives({
				id: row.id,
				name: row.name,
				productIds: row.product_ids,
			}),
		);
	}
}
