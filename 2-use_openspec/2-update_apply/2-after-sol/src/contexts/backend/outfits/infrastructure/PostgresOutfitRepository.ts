import { PostgresRepository } from "@/contexts/backend/shared/infrastructure/PostgresRepository";
import type { ProductId } from "@/contexts/shared/domain/ProductId";

import { OutfitNameAlreadyExistsError } from "../domain/errors/OutfitNameAlreadyExistsError";
import { Outfit } from "../domain/Outfit";
import type { OutfitId } from "../domain/OutfitId";
import type { OutfitName } from "../domain/OutfitName";
import type { OutfitRepository } from "../domain/OutfitRepository";

type OutfitRow = { id: string; name: string };
type PieceRow = { outfit_id: string; product_id: string };
export class PostgresOutfitRepository
	extends PostgresRepository
	implements OutfitRepository
{
	async save(outfit: Outfit): Promise<void> {
		const primitives = outfit.toPrimitives();
		try {
			await this.transaction(async () => {
				const sql = this.sql;
				await sql`insert into outfits (id, name) values (${primitives.id}, ${primitives.name})
     on conflict (id) do update set name = excluded.name`;
				await sql`delete from outfit_products where outfit_id = ${primitives.id}`;
				await sql`insert into outfit_products ${sql(
					primitives.productIds.map((id, position) => ({
						outfit_id: primitives.id,
						product_id: id,
						position,
					})),
					"outfit_id",
					"product_id",
					"position",
				)}`;
			});
		} catch (error) {
			if (
				typeof error === "object" &&
				error !== null &&
				"code" in error &&
				error.code === "23505" &&
				"constraint_name" in error &&
				error.constraint_name === "outfits_name_unique"
			) {
				throw new OutfitNameAlreadyExistsError(primitives.name);
			}
			throw error;
		}
	}

	async search(id: OutfitId): Promise<Outfit | null> {
		const rows = await this.sql<
			OutfitRow[]
		>`select id, name from outfits where id = ${id.value}`;

		return (await this.withPieces(rows)).at(0) ?? null;
	}

	async searchByName(name: OutfitName): Promise<Outfit | null> {
		const rows = await this.sql<
			OutfitRow[]
		>`select id, name from outfits where lower(btrim(name)) = lower(btrim(${name.value}::text))`;

		return (await this.withPieces(rows)).at(0) ?? null;
	}

	async searchAll(): Promise<Outfit[]> {
		return this.withPieces(
			await this.sql<
				OutfitRow[]
			>`select id, name from outfits order by name`,
		);
	}

	async searchContaining(productId: ProductId): Promise<Outfit[]> {
		return this.withPieces(
			await this.sql<
				OutfitRow[]
			>`select id, name from outfits o where exists (select 1 from outfit_products p where p.outfit_id = o.id and p.product_id = ${productId.value}) order by name`,
		);
	}

	async delete(id: OutfitId): Promise<void> {
		await this.sql`delete from outfits where id = ${id.value}`;
	}

	private async withPieces(rows: OutfitRow[]): Promise<Outfit[]> {
		if (rows.length === 0) {
			return [];
		}
		const sql = this.sql;
		const pieces = await sql<
			PieceRow[]
		>`select outfit_id, product_id from outfit_products where outfit_id in ${sql(rows.map((row) => row.id))} order by position`;

		return rows.map((row) =>
			Outfit.fromPrimitives({
				...row,
				productIds: pieces
					.filter((piece) => piece.outfit_id === row.id)
					.map((piece) => piece.product_id),
			}),
		);
	}
}
