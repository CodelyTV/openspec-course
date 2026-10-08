drop table if exists order_lines;
drop table if exists orders;
drop table if exists checkout_lines;
drop table if exists checkouts;
drop table if exists outfit_products;
drop table if exists outfits;
drop table if exists product_variants;
drop table if exists products;
drop table if exists users;

create table users (
	id text primary key,
	name text not null,
	email text not null unique
);

create table products (
	id text primary key,
	name text not null,
	collection text not null,
	category text not null,
	description text not null,
	price_amount integer not null,
	price_currency text not null default 'EUR',
	badges text[] not null default '{}',
	accent text not null
);

create table product_variants (
	id text primary key,
	product_id text not null references products(id) on delete cascade,
	color text not null,
	color_hex text not null,
	size text not null,
	online_stock integer not null check (online_stock >= 0),
	chest integer not null,
	length integer not null
);

create table outfits (
	id text primary key,
	name text not null unique
);

create table outfit_products (
	outfit_id text not null references outfits(id) on delete cascade,
	product_id text not null references products(id) on delete cascade,
	position integer not null,
	primary key (outfit_id, product_id)
);
create index outfit_products_product_id_idx on outfit_products(product_id);

create table checkouts (
	id text primary key,
	user_id text not null unique references users(id) on delete cascade,
	delivery_method text not null default 'home-delivery',
	status text not null default 'draft',
	version integer not null check (version > 0)
);

create table checkout_lines (
	checkout_id text not null references checkouts(id) on delete cascade,
	product_id text not null references products(id) on delete cascade,
	variant_id text not null references product_variants(id) on delete cascade,
	quantity integer not null check (quantity > 0),
	primary key (checkout_id, variant_id)
);

create table orders (
	id text primary key,
	user_id text not null references users(id),
	delivery_method text not null default 'home-delivery',
	subtotal_amount integer not null,
	currency text not null default 'EUR',
	status text not null default 'confirmed',
	created_at timestamptz not null default now()
);

create table order_lines (
	order_id text not null references orders(id) on delete cascade,
	product_id text not null,
	variant_id text not null,
	product_name text not null,
	color text not null,
	size text not null,
	quantity integer not null check (quantity > 0),
	unit_price_amount integer not null,
	primary key (order_id, variant_id)
);
