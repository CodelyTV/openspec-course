import { PostgresRepository } from "@/contexts/backend/shared/infrastructure/PostgresRepository";
import type { ProductId } from "@/contexts/shared/domain/ProductId";

import { OutfitNameAlreadyExistsError } from "../domain/errors/OutfitErrors";
import { Outfit } from "../domain/Outfit";
import type { OutfitId } from "../domain/OutfitId";
import type { OutfitRepository } from "../domain/OutfitRepository";

type OutfitRow = { id: string; name: string };
type MembershipRow = {
	outfit_id: string;
	product_id: string;
	position: number;
};

export class PostgresOutfitRepository
	extends PostgresRepository
	implements OutfitRepository
{
	async save(outfit: Outfit): Promise<void> {
		try {
			await this.transaction(async () => {
				await this.sql`
					insert into outfits (id, name) values (${outfit.id.value}, ${outfit.name})
					on conflict (id) do update set name = excluded.name
				`;
				await this
					.sql`delete from outfit_products where outfit_id = ${outfit.id.value}`;
				const members = outfit.productIds.map(
					(productId, position) => ({
						outfit_id: outfit.id.value,
						product_id: productId.value,
						position,
					}),
				);
				await this
					.sql`insert into outfit_products ${this.sql(members)}`;
			});
		} catch (error) {
			if (
				typeof error === "object" &&
				error !== null &&
				"code" in error &&
				error.code === "23505" &&
				"constraint_name" in error &&
				error.constraint_name === "outfits_name_key"
			) {
				throw new OutfitNameAlreadyExistsError();
			}
			throw error;
		}
	}

	async search(id: OutfitId): Promise<Outfit | null> {
		const rows = await this.sql<
			OutfitRow[]
		>`select * from outfits where id = ${id.value}`;

		return (await this.withProducts(rows))[0] ?? null;
	}

	async searchByName(name: string): Promise<Outfit | null> {
		const rows = await this.sql<
			OutfitRow[]
		>`select * from outfits where name = ${name}`;

		return (await this.withProducts(rows))[0] ?? null;
	}

	async searchAll(): Promise<Outfit[]> {
		const rows = await this.sql<
			OutfitRow[]
		>`select * from outfits order by name`;

		return this.withProducts(rows);
	}

	async searchContaining(productId: ProductId): Promise<Outfit[]> {
		const rows = await this.sql<OutfitRow[]>`
			select outfits.* from outfits
			join outfit_products on outfit_products.outfit_id = outfits.id
			where outfit_products.product_id = ${productId.value}
			order by outfits.name
		`;

		return this.withProducts(rows);
	}

	async countOutfitsByProduct(): Promise<Map<string, number>> {
		const rows = await this.sql<
			Array<{ product_id: string; count: string }>
		>`
			select product_id, count(*) from outfit_products group by product_id
		`;

		return new Map(rows.map((row) => [row.product_id, Number(row.count)]));
	}

	async delete(id: OutfitId): Promise<void> {
		await this.sql`delete from outfits where id = ${id.value}`;
	}

	private async withProducts(rows: OutfitRow[]): Promise<Outfit[]> {
		if (rows.length === 0) {
			return [];
		}
		const members = await this.sql<MembershipRow[]>`
			select outfit_id, product_id, position from outfit_products
			where outfit_id = any(${rows.map((row) => row.id)})
			order by outfit_id, position
		`;

		return rows.map((row) =>
			Outfit.fromPrimitives({
				id: row.id,
				name: row.name,
				productIds: members
					.filter((member) => member.outfit_id === row.id)
					.map((member) => member.product_id),
			}),
		);
	}
}
