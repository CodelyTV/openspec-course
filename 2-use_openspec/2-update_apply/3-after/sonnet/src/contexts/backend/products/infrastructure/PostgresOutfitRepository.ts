import postgres from "postgres";

import { PostgresRepository } from "@/contexts/backend/shared/infrastructure/PostgresRepository";
import type { ProductId } from "@/contexts/shared/domain/ProductId";

import { OutfitNameAlreadyExistsError } from "../domain/errors/OutfitNameAlreadyExistsError";
import { Outfit } from "../domain/Outfit";
import type { OutfitId } from "../domain/OutfitId";
import type { OutfitRepository } from "../domain/OutfitRepository";

type OutfitRow = {
	id: string;
	name: string;
};

type OutfitProductRow = {
	outfit_id: string;
	product_id: string;
};

type OutfitCountRow = {
	product_id: string;
	outfits_count: number;
};

const uniqueViolationCode = "23505";

export class PostgresOutfitRepository
	extends PostgresRepository
	implements OutfitRepository
{
	async save(outfit: Outfit): Promise<void> {
		const primitives = outfit.toPrimitives();

		try {
			await this.transaction(async () => {
				const sql = this.sql;

				await sql`
					insert into outfits (id, name)
					values (${primitives.id}, ${primitives.name})
					on conflict (id) do update set name = excluded.name
				`;

				await sql`
					delete from outfit_products
					where outfit_id = ${primitives.id}
				`;

				await sql`
					insert into outfit_products ${sql(
						primitives.productIds.map((productId, position) => ({
							outfit_id: primitives.id,
							product_id: productId,
							position,
						})),
						"outfit_id",
						"product_id",
						"position",
					)}
				`;
			});
		} catch (error) {
			if (this.isNameTaken(error)) {
				throw new OutfitNameAlreadyExistsError(primitives.name);
			}

			throw error;
		}
	}

	async search(id: OutfitId): Promise<Outfit | null> {
		const outfitRows = await this.sql<OutfitRow[]>`
			select id, name
			from outfits
			where id = ${id.value}
		`;

		return (await this.withProducts(outfitRows)).at(0) ?? null;
	}

	async searchByName(name: string): Promise<Outfit | null> {
		const outfitRows = await this.sql<OutfitRow[]>`
			select id, name
			from outfits
			where name = ${name}
		`;

		return (await this.withProducts(outfitRows)).at(0) ?? null;
	}

	async searchAll(): Promise<Outfit[]> {
		const outfitRows = await this.sql<OutfitRow[]>`
			select id, name
			from outfits
			order by name
		`;

		return this.withProducts(outfitRows);
	}

	async searchContaining(productId: ProductId): Promise<Outfit[]> {
		const outfitRows = await this.sql<OutfitRow[]>`
			select id, name
			from outfits
			where id in (
				select outfit_id
				from outfit_products
				where product_id = ${productId.value}
			)
			order by name
		`;

		return this.withProducts(outfitRows);
	}

	async countOutfitsByProduct(): Promise<Map<string, number>> {
		const rows = await this.sql<OutfitCountRow[]>`
			select product_id, count(*)::int as outfits_count
			from outfit_products
			group by product_id
		`;

		return new Map(rows.map((row) => [row.product_id, row.outfits_count]));
	}

	async delete(id: OutfitId): Promise<void> {
		await this.sql`
			delete from outfits
			where id = ${id.value}
		`;
	}

	private isNameTaken(error: unknown): boolean {
		return (
			error instanceof postgres.PostgresError &&
			error.code === uniqueViolationCode &&
			error.constraint_name === "outfits_name_key"
		);
	}

	private async withProducts(outfitRows: OutfitRow[]): Promise<Outfit[]> {
		if (outfitRows.length === 0) {
			return [];
		}

		const productRows = await this.sql<OutfitProductRow[]>`
			select outfit_id, product_id
			from outfit_products
			where outfit_id = any(${outfitRows.map((outfit) => outfit.id)})
			order by outfit_id, position
		`;

		return outfitRows.map((outfit) =>
			Outfit.fromPrimitives({
				id: outfit.id,
				name: outfit.name,
				productIds: productRows
					.filter((product) => product.outfit_id === outfit.id)
					.map((product) => product.product_id),
			}),
		);
	}
}
