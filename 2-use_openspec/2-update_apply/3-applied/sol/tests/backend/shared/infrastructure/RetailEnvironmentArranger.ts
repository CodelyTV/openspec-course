import type { Product } from "@/contexts/backend/products/domain/Product";
import type { PostgresConnection } from "@/contexts/backend/shared/infrastructure/PostgresConnection";
import type { User } from "@/contexts/backend/users/domain/User";

export class RetailEnvironmentArranger {
	constructor(private readonly connection: PostgresConnection) {}

	async arrange(): Promise<void> {
		await this.connection.sql.unsafe(`DO
$$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public')
    LOOP
        EXECUTE 'TRUNCATE TABLE public.' || quote_ident(r.tablename) || ' CASCADE';
    END LOOP;
END
$$;`);
	}

	async givenUsers(...users: User[]): Promise<void> {
		const sql = this.connection.sql;

		await sql`insert into users ${sql(
			users.map((user) => user.toPrimitives()),
			"id",
			"name",
			"email",
		)}`;
	}

	async givenProducts(...products: Product[]): Promise<void> {
		const sql = this.connection.sql;
		const primitives = products.map((product) => product.toPrimitives());

		await sql`
			insert into products ${sql(
				primitives.map((product) => ({
					id: product.id,
					name: product.name,
					collection: product.collection,
					category: product.category,
					description: product.description,
					price_amount: product.price.amount,
					price_currency: product.price.currency,
					badges: product.badges,
					accent: product.accent,
				})),
			)}
		`;

		await sql`
			insert into product_variants ${sql(
				primitives.flatMap((product) =>
					product.variants.map((variant) => ({
						id: variant.id,
						product_id: product.id,
						color: variant.color,
						color_hex: variant.colorHex,
						size: variant.size,
						online_stock: variant.onlineStock,
						chest: variant.measurements.chest,
						length: variant.measurements.length,
					})),
				),
			)}
		`;
	}

	async close(): Promise<void> {
		await this.connection.sql.end({ timeout: 5 });
	}
}
