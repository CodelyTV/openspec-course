import postgres from "postgres";

import { PostgresRepository } from "@/contexts/backend/shared/infrastructure/PostgresRepository";
import type { ProductId } from "@/contexts/shared/domain/ProductId";

import { OutfitNameAlreadyExistsError } from "../domain/errors/OutfitNameAlreadyExistsError";
import { Outfit } from "../domain/Outfit";
import type { OutfitId } from "../domain/OutfitId";
import type { OutfitRepository } from "../domain/OutfitRepository";

const uniqueViolationCode = "23505";
const outfitNameConstraint = "outfits_name_key";

type OutfitRow = {
	id: string;
	name: string;
};

type OutfitProductRow = {
	outfit_id: string;
	product_id: string;
	position: number;
};

type ProductOutfitCountRow = {
	product_id: string;
	outfits_count: number;
};

export class PostgresOutfitRepository
	extends PostgresRepository
	implements OutfitRepository
{
	async save(outfit: Outfit): Promise<void> {
		const primitives = outfit.toPrimitives();

		await this.transaction(async () => {
			const sql = this.sql;

			try {
				await sql`
					insert into outfits (id, name)
					values (${primitives.id}, ${primitives.name})
					on conflict (id) do update set name = excluded.name
				`;
			} catch (error) {
				if (isOutfitNameUniqueViolation(error)) {
					throw new OutfitNameAlreadyExistsError(primitives.name);
				}

				throw error;
			}

			await sql`
				delete from outfit_products
				where outfit_id = ${primitives.id}
			`;

			await sql`
				insert into outfit_products ${sql(
					primitives.productIds.map((productId, index) => ({
						outfit_id: primitives.id,
						product_id: productId,
						position: index + 1,
					})),
					"outfit_id",
					"product_id",
					"position",
				)}
			`;
		});
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
		`;

		return this.withProducts(outfitRows);
	}

	async searchContaining(productId: ProductId): Promise<Outfit[]> {
		const outfitRows = await this.sql<OutfitRow[]>`
			select outfits.id, outfits.name
			from outfits
			join outfit_products on outfit_products.outfit_id = outfits.id
			where outfit_products.product_id = ${productId.value}
		`;

		return this.withProducts(outfitRows);
	}

	async countOutfitsByProduct(): Promise<Map<string, number>> {
		const rows = await this.sql<ProductOutfitCountRow[]>`
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

	private async withProducts(outfitRows: OutfitRow[]): Promise<Outfit[]> {
		if (outfitRows.length === 0) {
			return [];
		}

		const outfitProductRows = await this.sql<OutfitProductRow[]>`
			select outfit_id, product_id, position
			from outfit_products
			where outfit_id = any(${outfitRows.map((outfit) => outfit.id)})
			order by outfit_id, position
		`;

		return outfitRows.map((outfit) =>
			Outfit.fromPrimitives({
				id: outfit.id,
				name: outfit.name,
				productIds: outfitProductRows
					.filter((row) => row.outfit_id === outfit.id)
					.map((row) => row.product_id),
			}),
		);
	}
}

function isOutfitNameUniqueViolation(error: unknown): boolean {
	return (
		error instanceof postgres.PostgresError &&
		error.code === uniqueViolationCode &&
		error.constraint_name === outfitNameConstraint
	);
}
