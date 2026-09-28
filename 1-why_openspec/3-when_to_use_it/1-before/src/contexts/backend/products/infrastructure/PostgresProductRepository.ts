import { PostgresRepository } from "@/contexts/backend/shared/infrastructure/PostgresRepository";
import { parseCurrency } from "@/contexts/shared/domain/Money";

import { parseProductAccent, Product } from "../domain/Product";
import type { ProductId } from "../domain/ProductId";
import type {
	ProductCriteria,
	ProductRepository,
} from "../domain/ProductRepository";
import { parseSize } from "../domain/ProductVariant";
import type { VariantId } from "../domain/VariantId";

type ProductRow = {
	id: string;
	name: string;
	collection: string;
	category: string;
	description: string;
	price_amount: number;
	price_currency: string;
	badges: string[];
	accent: string;
};

type ProductVariantRow = {
	id: string;
	product_id: string;
	color: string;
	color_hex: string;
	size: string;
	online_stock: number;
	chest: number;
	length: number;
};

export class PostgresProductRepository
	extends PostgresRepository
	implements ProductRepository
{
	async searchAll(): Promise<Product[]> {
		return this.searchMatching({});
	}

	async searchMatching(criteria: ProductCriteria): Promise<Product[]> {
		const collection = criteria.collection ?? null;
		const category = criteria.category ?? null;

		const productRows = await this.sql<ProductRow[]>`
			select *
			from products
			where (${collection}::text is null or collection = ${collection})
				and (${category}::text is null or category = ${category})
			order by collection, name
		`;

		return this.withVariants(productRows);
	}

	async search(id: ProductId): Promise<Product | null> {
		return (await this.searchByIds([id])).at(0) ?? null;
	}

	async searchByIds(ids: ProductId[]): Promise<Product[]> {
		const productRows = await this.sql<ProductRow[]>`
			select *
			from products
			where id = any(${ids.map((id) => id.value)})
			order by collection, name
		`;

		return this.withVariants(productRows);
	}

	async searchByVariantId(variantId: VariantId): Promise<Product | null> {
		const productRows = await this.sql<ProductRow[]>`
			select products.*
			from products
			join product_variants on product_variants.product_id = products.id
			where product_variants.id = ${variantId.value}
		`;

		return (await this.withVariants(productRows)).at(0) ?? null;
	}

	async searchOthersSameCollectionFirst(
		product: Product,
		limit: number,
	): Promise<Product[]> {
		const productRows = await this.sql<ProductRow[]>`
			select *
			from products
			where id <> ${product.id.value}
			order by collection = ${product.collection} desc, collection, name
			limit ${limit}
		`;

		return this.withVariants(productRows);
	}

	async searchCategories(): Promise<string[]> {
		const rows = await this.sql<Array<{ category: string }>>`
			select distinct category
			from products
			order by category
		`;

		return rows.map((row) => row.category);
	}

	async searchCollections(): Promise<string[]> {
		const rows = await this.sql<Array<{ collection: string }>>`
			select distinct collection
			from products
			order by collection
		`;

		return rows.map((row) => row.collection);
	}

	async decreaseStockIfEnoughUnitsLeft(
		variantId: VariantId,
		quantity: number,
	): Promise<boolean> {
		const result = await this.sql`
			update product_variants
			set online_stock = online_stock - ${quantity}
			where id = ${variantId.value} and online_stock >= ${quantity}
		`;

		return result.count === 1;
	}

	private async withVariants(productRows: ProductRow[]): Promise<Product[]> {
		if (productRows.length === 0) {
			return [];
		}

		const variantRows = await this.sql<ProductVariantRow[]>`
			select *
			from product_variants
			where product_id = any(${productRows.map((product) => product.id)})
			order by
				product_id,
				array_position(array['XS', 'S', 'M', 'L', 'XL'], size),
				color
		`;

		return productRows.map((product) =>
			this.toProduct(product, variantRows),
		);
	}

	private toProduct(
		product: ProductRow,
		variantRows: ProductVariantRow[],
	): Product {
		return Product.fromPrimitives({
			id: product.id,
			name: product.name,
			collection: product.collection,
			category: product.category,
			description: product.description,
			price: {
				amount: product.price_amount,
				currency: parseCurrency(product.price_currency),
			},
			badges: product.badges,
			accent: parseProductAccent(product.accent),
			variants: variantRows
				.filter((variant) => variant.product_id === product.id)
				.map((variant) => ({
					id: variant.id,
					color: variant.color,
					colorHex: variant.color_hex,
					size: parseSize(variant.size),
					onlineStock: variant.online_stock,
					measurements: {
						chest: variant.chest,
						length: variant.length,
					},
				})),
		});
	}
}
