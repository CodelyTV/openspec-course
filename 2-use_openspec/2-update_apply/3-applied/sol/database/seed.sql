insert into users (id, name, email)
values
	('user-a1c92f04', 'AI Builder', 'aibuilder@codely.com'),
	('user-7e3b19a2', 'Pablo Rodríguez', 'pablo.rodriguez@codely.com'),
	('user-4d6f8c11', 'Javier Ferrer', 'javier.ferrer@codely.com'),
	('user-9b2e5a77', 'Rafa Gómez', 'rafa.gomez@codely.com');

insert into products (id, name, collection, category, description, price_amount, price_currency, badges, accent)
values
	('hexagonal-overshirt', 'Hexagonal Overshirt', 'Architecture Drop', 'Overshirts', 'Structured overshirt with a technical drape. The layer you throw on when the mid-season weather throws uncaught exceptions.', 89, 'EUR', array['Low stock'], 'green'),
	('event-storm-knit', 'Event Storm Knit', 'Architecture Drop', 'Sweatshirts', 'Compact knit with a soft feel and raised texture. To keep your cool when the event storming session gets out of hand.', 69, 'EUR', array['Limited edition'], 'violet'),
	('domain-event-tee', 'Domain Event Tee', 'Architecture Drop', 'T-shirts', 'Heavyweight cotton tee with a relaxed body. A solid staple, like a test that never fails.', 39, 'EUR', array['New'], 'green'),
	('aggregate-hoodie', 'Aggregate Hoodie', 'Architecture Drop', 'Sweatshirts', 'Hoodie with a brushed interior and a loose fit. The comfort of a deploy Friday where everything goes right.', 95, 'EUR', array[]::text[], 'violet'),
	('bounded-context-trousers', 'Bounded Context Trousers', 'Core Wardrobe', 'Trousers', 'Relaxed-fit trousers with an elastic waist. Comfortable and with well-defined boundaries, no context leaks.', 79, 'EUR', array[]::text[], 'yellow'),
	('refactor-utility-vest', 'Refactor Utility Vest', 'Core Wardrobe', 'Outerwear', 'Lightweight utility vest with modular pockets. Strip away what you do not need and keep only the essentials.', 99, 'EUR', array['New'], 'pink'),
	('value-object-shirt', 'Value Object Shirt', 'Core Wardrobe', 'Shirts', 'Poplin shirt with a clean collar and a regular fit. Immutable and reliable: it always looks good.', 59, 'EUR', array[]::text[], 'yellow'),
	('ubiquitous-chinos', 'Ubiquitous Chinos', 'Core Wardrobe', 'Trousers', 'Versatile cotton chinos with a tapered leg. The common language of your wardrobe: they work for everything.', 65, 'EUR', array['Low stock'], 'pink'),
	('observability-jacket', 'Observability Jacket', 'Signal Series', 'Outerwear', 'Water-repellent shell jacket with sealed seams. Keeps you dry even when the day goes red.', 129, 'EUR', array['Limited edition'], 'green'),
	('circuit-breaker-knit', 'Circuit Breaker Knit', 'Signal Series', 'Sweatshirts', 'Medium-weight merino-blend crewneck sweater. Breaks the cold before it propagates.', 75, 'EUR', array['New'], 'violet');

insert into product_variants (id, product_id, color, color_hex, size, online_stock, chest, length)
values
	('hexagonal-overshirt-ink-s', 'hexagonal-overshirt', 'Moss', '#6d7a4f', 'S', 3, 108, 71),
	('hexagonal-overshirt-ink-m', 'hexagonal-overshirt', 'Moss', '#6d7a4f', 'M', 2, 112, 73),
	('hexagonal-overshirt-ink-l', 'hexagonal-overshirt', 'Moss', '#6d7a4f', 'L', 0, 116, 75),
	('hexagonal-overshirt-moss-s', 'hexagonal-overshirt', 'Indigo', '#35415c', 'S', 4, 108, 71),
	('hexagonal-overshirt-moss-m', 'hexagonal-overshirt', 'Indigo', '#35415c', 'M', 1, 112, 73),
	('event-storm-knit-black-s', 'event-storm-knit', 'Black', '#1a1a1a', 'S', 7, 96, 62),
	('event-storm-knit-black-m', 'event-storm-knit', 'Black', '#1a1a1a', 'M', 4, 100, 64),
	('event-storm-knit-black-l', 'event-storm-knit', 'Black', '#1a1a1a', 'L', 0, 104, 66),
	('event-storm-knit-ecru-s', 'event-storm-knit', 'Ecru', '#e7dfc9', 'S', 2, 96, 62),
	('event-storm-knit-ecru-m', 'event-storm-knit', 'Ecru', '#e7dfc9', 'M', 2, 100, 64),
	('domain-event-tee-white-s', 'domain-event-tee', 'White', '#f4f3ee', 'S', 12, 100, 68),
	('domain-event-tee-white-m', 'domain-event-tee', 'White', '#f4f3ee', 'M', 10, 104, 70),
	('domain-event-tee-white-l', 'domain-event-tee', 'White', '#f4f3ee', 'L', 6, 108, 72),
	('domain-event-tee-navy-m', 'domain-event-tee', 'Navy', '#26364f', 'M', 8, 104, 70),
	('domain-event-tee-navy-l', 'domain-event-tee', 'Navy', '#26364f', 'L', 4, 108, 72),
	('aggregate-hoodie-graphite-s', 'aggregate-hoodie', 'Camel', '#c19a6b', 'S', 5, 112, 68),
	('aggregate-hoodie-graphite-m', 'aggregate-hoodie', 'Camel', '#c19a6b', 'M', 3, 116, 70),
	('aggregate-hoodie-graphite-l', 'aggregate-hoodie', 'Camel', '#c19a6b', 'L', 2, 120, 72),
	('aggregate-hoodie-sand-m', 'aggregate-hoodie', 'Stone', '#b7ae9e', 'M', 4, 116, 70),
	('bounded-context-trousers-navy-s', 'bounded-context-trousers', 'Khaki', '#7f7448', 'S', 6, 78, 102),
	('bounded-context-trousers-navy-m', 'bounded-context-trousers', 'Khaki', '#7f7448', 'M', 6, 82, 104),
	('bounded-context-trousers-navy-l', 'bounded-context-trousers', 'Khaki', '#7f7448', 'L', 3, 86, 106),
	('bounded-context-trousers-stone-m', 'bounded-context-trousers', 'Stone', '#b7ae9e', 'M', 5, 82, 104),
	('refactor-utility-vest-graphite-s', 'refactor-utility-vest', 'Camel', '#c19a6b', 'S', 5, 104, 64),
	('refactor-utility-vest-graphite-m', 'refactor-utility-vest', 'Camel', '#c19a6b', 'M', 3, 108, 66),
	('refactor-utility-vest-sand-m', 'refactor-utility-vest', 'Stone', '#b7ae9e', 'M', 2, 108, 66),
	('value-object-shirt-white-s', 'value-object-shirt', 'Chambray', '#6f8bad', 'S', 8, 100, 74),
	('value-object-shirt-white-m', 'value-object-shirt', 'Chambray', '#6f8bad', 'M', 6, 104, 76),
	('value-object-shirt-white-l', 'value-object-shirt', 'Chambray', '#6f8bad', 'L', 4, 108, 78),
	('value-object-shirt-blue-m', 'value-object-shirt', 'Sky', '#bcd6e8', 'M', 5, 104, 76),
	('ubiquitous-chinos-olive-s', 'ubiquitous-chinos', 'Salmon', '#d98f7a', 'S', 2, 80, 102),
	('ubiquitous-chinos-olive-m', 'ubiquitous-chinos', 'Salmon', '#d98f7a', 'M', 1, 84, 104),
	('ubiquitous-chinos-sand-m', 'ubiquitous-chinos', 'Sand', '#cbb693', 'M', 3, 84, 104),
	('ubiquitous-chinos-sand-l', 'ubiquitous-chinos', 'Sand', '#cbb693', 'L', 0, 88, 106),
	('observability-jacket-black-m', 'observability-jacket', 'Black', '#1a1a1a', 'M', 3, 114, 72),
	('observability-jacket-black-l', 'observability-jacket', 'Black', '#1a1a1a', 'L', 2, 118, 74),
	('observability-jacket-olive-m', 'observability-jacket', 'Olive', '#6f6a3a', 'M', 2, 114, 72),
	('circuit-breaker-knit-charcoal-s', 'circuit-breaker-knit', 'Black', '#1a1a1a', 'S', 6, 98, 66),
	('circuit-breaker-knit-charcoal-m', 'circuit-breaker-knit', 'Black', '#1a1a1a', 'M', 5, 102, 68),
	('circuit-breaker-knit-rust-m', 'circuit-breaker-knit', 'Rust', '#9c4a2d', 'M', 3, 102, 68),
	('circuit-breaker-knit-rust-l', 'circuit-breaker-knit', 'Rust', '#9c4a2d', 'L', 2, 106, 70);

insert into checkouts (id, user_id, delivery_method, status, version)
values ('e91788e4-0a5f-4c79-baac-9af97f0385f5', 'user-a1c92f04', 'home-delivery', 'draft', 1);

insert into checkout_lines (checkout_id, product_id, variant_id, quantity)
values ('e91788e4-0a5f-4c79-baac-9af97f0385f5', 'hexagonal-overshirt', 'hexagonal-overshirt-ink-m', 1);

insert into products (id, name, collection, category, description, price_amount, price_currency, badges, accent)
values
	('pure-function-tee', 'Pure Function Tee', 'Core Wardrobe', 'T-shirts', 'Combed cotton tee with a clean drape. No side effects: put it on, it fits well, and always returns the same result.', 39, 'EUR', array['New'], 'violet'),
	('null-pointer-tee', 'Null Pointer Tee', 'Signal Series', 'T-shirts', 'Soft knit tee with a reinforced collar. The staple you can always point to without fear.', 35, 'EUR', array[]::text[], 'pink'),
	('idempotent-shirt', 'Idempotent Shirt', 'Architecture Drop', 'Shirts', 'Regular-fit poplin shirt. No matter how many times you put it on, the result is the same: impeccable.', 59, 'EUR', array['New'], 'yellow'),
	('merge-conflict-jeans', 'Merge Conflict Jeans', 'Signal Series', 'Trousers', 'Sturdy denim jeans with a straight cut. They resolve any conflict between comfort and style.', 85, 'EUR', array[]::text[], 'green'),
	('facade-overshirt', 'Facade Overshirt', 'Core Wardrobe', 'Overshirts', 'Lightweight overshirt that works as a mid-layer. A simple interface on the outside, cozy warmth on the inside.', 89, 'EUR', array['Limited edition'], 'pink');

insert into product_variants (id, product_id, color, color_hex, size, online_stock, chest, length)
values
	('pure-function-tee-black-s', 'pure-function-tee', 'Black', '#1a1a1a', 'S', 14, 102, 68),
	('pure-function-tee-black-m', 'pure-function-tee', 'Black', '#1a1a1a', 'M', 12, 106, 70),
	('pure-function-tee-black-l', 'pure-function-tee', 'Black', '#1a1a1a', 'L', 8, 110, 72),
	('pure-function-tee-white-m', 'pure-function-tee', 'White', '#f4f3ee', 'M', 9, 106, 70),
	('null-pointer-tee-black-s', 'null-pointer-tee', 'Black', '#1a1a1a', 'S', 11, 102, 68),
	('null-pointer-tee-black-m', 'null-pointer-tee', 'Black', '#1a1a1a', 'M', 9, 106, 70),
	('null-pointer-tee-black-l', 'null-pointer-tee', 'Black', '#1a1a1a', 'L', 5, 110, 72),
	('null-pointer-tee-navy-m', 'null-pointer-tee', 'Navy', '#26364f', 'M', 7, 106, 70),
	('idempotent-shirt-navy-s', 'idempotent-shirt', 'Navy', '#26364f', 'S', 7, 102, 74),
	('idempotent-shirt-navy-m', 'idempotent-shirt', 'Navy', '#26364f', 'M', 6, 106, 76),
	('idempotent-shirt-navy-l', 'idempotent-shirt', 'Navy', '#26364f', 'L', 3, 110, 78),
	('idempotent-shirt-white-m', 'idempotent-shirt', 'White', '#f4f3ee', 'M', 5, 106, 76),
	('merge-conflict-jeans-indigo-s', 'merge-conflict-jeans', 'Indigo', '#2f3b52', 'S', 6, 80, 102),
	('merge-conflict-jeans-indigo-m', 'merge-conflict-jeans', 'Indigo', '#2f3b52', 'M', 6, 84, 104),
	('merge-conflict-jeans-indigo-l', 'merge-conflict-jeans', 'Indigo', '#2f3b52', 'L', 4, 88, 106),
	('merge-conflict-jeans-black-m', 'merge-conflict-jeans', 'Black', '#1a1a1a', 'M', 5, 84, 104),
	('facade-overshirt-teal-s', 'facade-overshirt', 'Teal', '#4f8a8b', 'S', 5, 108, 71),
	('facade-overshirt-teal-m', 'facade-overshirt', 'Teal', '#4f8a8b', 'M', 4, 112, 73),
	('facade-overshirt-teal-l', 'facade-overshirt', 'Teal', '#4f8a8b', 'L', 2, 116, 75),
	('facade-overshirt-sand-m', 'facade-overshirt', 'Sand', '#cbb693', 'M', 3, 112, 73);

update product_variants set online_stock = 0 where product_id = 'circuit-breaker-knit';

insert into outfits (id, name)
values
	('outfit-deploy-friday', 'Deploy Friday'),
	('outfit-signal-ready', 'Signal Ready'),
	('outfit-weekend-refactor', 'Weekend Refactor');

insert into outfit_products (outfit_id, product_id, position)
values
	('outfit-deploy-friday', 'pure-function-tee', 0),
	('outfit-deploy-friday', 'aggregate-hoodie', 1),
	('outfit-signal-ready', 'observability-jacket', 0),
	('outfit-signal-ready', 'circuit-breaker-knit', 1),
	('outfit-weekend-refactor', 'hexagonal-overshirt', 0),
	('outfit-weekend-refactor', 'pure-function-tee', 1),
	('outfit-weekend-refactor', 'bounded-context-trousers', 2);

create temporary table seeded_orders (sequence integer primary key, id text not null unique);

insert into seeded_orders (sequence, id)
values
	(1, '60c647f5-91f8-4471-97a3-24592ba1100c'),
	(2, '68b9dc7e-ba6a-4f81-b168-805f2c03eb59'),
	(3, '103a9c55-91ea-4634-bc42-1a772eb47c5f'),
	(4, 'b46651c8-2a3e-4990-adb6-f005321df377'),
	(5, '4e1f4151-bb5d-444c-b660-55fee73d0d59'),
	(6, 'c81d69e0-89d8-4b35-a632-482d58e1a05b'),
	(7, '1b917ad1-5154-46b7-8b65-a2c4c54f98bc'),
	(8, '1598f365-2032-4e8f-9b68-a50ac3964795'),
	(9, 'a717d4d8-8a5d-4b09-a73e-2dc851467bc0'),
	(10, 'a1b72ff1-01f8-446d-8a8d-8793422c211d'),
	(11, 'cea649d2-bb11-498d-8c2b-3b0b2e015f56'),
	(12, 'e7c7ee8f-2a00-4296-bac4-ed7ca69c2e4f'),
	(13, '9328717d-32c3-40bc-8fef-332f4bb228c1'),
	(14, 'd3f3f1d1-246c-4e5c-819e-6fc3d23f545c'),
	(15, '7d427247-7321-42ab-bb47-75590d8f60e6'),
	(16, '1f8656f9-76e0-4596-ba8e-5e79d47a0e95'),
	(17, '02c55dfb-1436-449f-9efd-0161ddd9abe5'),
	(18, '5e240167-3204-4160-9e20-e99880f33e2a'),
	(19, '26f62186-6928-43ce-b5db-403456079b70'),
	(20, '1cbb58db-df55-46d8-b28a-8a2684fb60a8'),
	(21, '7bd28a64-b345-427e-83d5-5de183f5715a'),
	(22, '3224b7e7-ed87-4ef2-a1ef-cfbd79293e8c'),
	(23, 'bcf1ee40-dd28-4104-9559-fad35b96d96e'),
	(24, 'aa4b805c-6abe-4094-bbd9-801edf7e494c'),
	(25, '2b51774c-31be-4bce-a029-3cb68f061a75'),
	(26, '74198115-d594-4836-8761-4eb596822379'),
	(27, 'b27d231a-33fe-4c16-a152-3c9f0180aea9'),
	(28, '4ee1674f-7f46-4d9b-8d69-0f464922ffdb');

insert into orders (id, user_id, delivery_method, subtotal_amount, currency, status, created_at)
select so.id,
	(array['user-a1c92f04', 'user-7e3b19a2', 'user-4d6f8c11', 'user-9b2e5a77'])[1 + (so.sequence % 4)],
	'home-delivery', 0, 'EUR', 'confirmed',
	now() - ((so.sequence * 2) || ' days')::interval - ((so.sequence % 24) || ' hours')::interval
from seeded_orders so;

with variants_numbered as (
	select v.id as variant_id, v.product_id, p.name as product_name, v.color, v.size, p.price_amount,
		row_number() over (order by v.id) as rn, count(*) over () as total
	from product_variants v
	join products p on p.id = v.product_id
)
insert into order_lines (order_id, product_id, variant_id, product_name, color, size, quantity, unit_price_amount)
select so.id, vn.product_id, vn.variant_id, vn.product_name, vn.color, vn.size, 1 + (so.sequence % 2), vn.price_amount
from seeded_orders so
join variants_numbered vn on vn.rn = ((so.sequence * 7) % vn.total) + 1;

with variants_numbered as (
	select v.id as variant_id, v.product_id, p.name as product_name, v.color, v.size, p.price_amount,
		row_number() over (order by v.id) as rn, count(*) over () as total
	from product_variants v
	join products p on p.id = v.product_id
)
insert into order_lines (order_id, product_id, variant_id, product_name, color, size, quantity, unit_price_amount)
select so.id, vn.product_id, vn.variant_id, vn.product_name, vn.color, vn.size, 1, vn.price_amount
from seeded_orders so
join variants_numbered vn on vn.rn = ((so.sequence * 13 + 5) % vn.total) + 1
where so.sequence % 2 = 0
on conflict (order_id, variant_id) do nothing;

update orders o
set subtotal_amount = coalesce((select sum(ol.quantity * ol.unit_price_amount) from order_lines ol where ol.order_id = o.id), 0)
where o.id in (select id from seeded_orders);

drop table seeded_orders;
