import "server-only";

import { CartVariantAdder } from "@/contexts/backend/checkout/application/add/CartVariantAdder";
import { CheckoutConfirmer } from "@/contexts/backend/checkout/application/confirm/CheckoutConfirmer";
import { CartItemCounter } from "@/contexts/backend/checkout/application/count/CartItemCounter";
import { CartVariantRemover } from "@/contexts/backend/checkout/application/remove/CartVariantRemover";
import { CheckoutViewGetter } from "@/contexts/backend/checkout/application/view/CheckoutViewGetter";
import { OrdersOrderPlacement } from "@/contexts/backend/checkout/infrastructure/OrdersOrderPlacement";
import { PostgresCheckoutRepository } from "@/contexts/backend/checkout/infrastructure/PostgresCheckoutRepository";
import { ProductsCheckoutCatalog } from "@/contexts/backend/checkout/infrastructure/ProductsCheckoutCatalog";
import { ProductsStockReserver } from "@/contexts/backend/checkout/infrastructure/ProductsStockReserver";
import { OrderFinder } from "@/contexts/backend/orders/application/find/OrderFinder";
import { UserOrderFinder } from "@/contexts/backend/orders/application/find-mine/UserOrderFinder";
import { OrdersLister } from "@/contexts/backend/orders/application/list/OrdersLister";
import { UserOrdersLister } from "@/contexts/backend/orders/application/list-mine/UserOrdersLister";
import { RecentOrdersLister } from "@/contexts/backend/orders/application/list-recent/RecentOrdersLister";
import { OrderPlacer } from "@/contexts/backend/orders/application/place/OrderPlacer";
import { OrdersSummaryGetter } from "@/contexts/backend/orders/application/summarize/OrdersSummaryGetter";
import { PostgresOrderRepository } from "@/contexts/backend/orders/infrastructure/PostgresOrderRepository";
import { UsersCustomerDirectory } from "@/contexts/backend/orders/infrastructure/UsersCustomerDirectory";
import { OutfitCreator } from "@/contexts/backend/outfits/application/create/OutfitCreator";
import { OutfitDeleter } from "@/contexts/backend/outfits/application/delete/OutfitDeleter";
import { OutfitFinder } from "@/contexts/backend/outfits/application/find/OutfitFinder";
import { ProductOutfitsFinder } from "@/contexts/backend/outfits/application/find-by-product/ProductOutfitsFinder";
import { OutfitsLister } from "@/contexts/backend/outfits/application/list/OutfitsLister";
import { OutfitUpdater } from "@/contexts/backend/outfits/application/update/OutfitUpdater";
import { PostgresOutfitRepository } from "@/contexts/backend/outfits/infrastructure/PostgresOutfitRepository";
import { ProductsOutfitCatalog } from "@/contexts/backend/outfits/infrastructure/ProductsOutfitCatalog";
import { CategoriesLister } from "@/contexts/backend/products/application/categories/CategoriesLister";
import { CollectionsLister } from "@/contexts/backend/products/application/collections/CollectionsLister";
import { StockDecreaser } from "@/contexts/backend/products/application/decrease-stock/StockDecreaser";
import { ProductFinder } from "@/contexts/backend/products/application/find/ProductFinder";
import { RelatedProductsFinder } from "@/contexts/backend/products/application/find-related/RelatedProductsFinder";
import { InventoryLister } from "@/contexts/backend/products/application/inventory/InventoryLister";
import { LowStockLister } from "@/contexts/backend/products/application/low-stock/LowStockLister";
import { ProductsSearcher } from "@/contexts/backend/products/application/search/ProductsSearcher";
import { ProductsByIdsSearcher } from "@/contexts/backend/products/application/search-by-ids/ProductsByIdsSearcher";
import { VariantsSearcher } from "@/contexts/backend/products/application/search-variants/VariantsSearcher";
import { PostgresProductRepository } from "@/contexts/backend/products/infrastructure/PostgresProductRepository";
import { CurrentUserGetter } from "@/contexts/backend/users/application/current/CurrentUserGetter";
import { UsersByIdsSearcher } from "@/contexts/backend/users/application/search-by-ids/UsersByIdsSearcher";
import { FakeSessionCurrentUserProvider } from "@/contexts/backend/users/infrastructure/FakeSessionCurrentUserProvider";
import { PostgresUserRepository } from "@/contexts/backend/users/infrastructure/PostgresUserRepository";
import type { CurrentUserProvider } from "@/contexts/shared/domain/CurrentUserProvider";

import { CryptoIdGenerator } from "./CryptoIdGenerator";
import { PostgresConnection } from "./PostgresConnection";
import { PostgresUnitOfWork } from "./PostgresUnitOfWork";
import { SystemClock } from "./SystemClock";

class RetailContainer {
	private readonly connection = new PostgresConnection();
	private readonly outfitRepository = new PostgresOutfitRepository(
		this.connection,
	);

	private readonly productRepository = new PostgresProductRepository(
		this.connection,
	);

	private readonly orderRepository = new PostgresOrderRepository(
		this.connection,
	);

	private readonly checkoutRepository = new PostgresCheckoutRepository(
		this.connection,
	);

	private readonly userRepository = new PostgresUserRepository(
		this.connection,
	);

	private readonly unitOfWork = new PostgresUnitOfWork(this.connection);

	private readonly idGenerator = new CryptoIdGenerator();

	private readonly clock = new SystemClock();

	private readonly currentUserProviderInstance =
		new FakeSessionCurrentUserProvider();

	private get outfitCatalog(): ProductsOutfitCatalog {
		return new ProductsOutfitCatalog(this.productsByIdsSearcher);
	}

	get outfitCreator(): OutfitCreator {
		return new OutfitCreator(
			this.outfitRepository,
			this.idGenerator,
			this.outfitCatalog,
		);
	}

	get outfitUpdater(): OutfitUpdater {
		return new OutfitUpdater(this.outfitRepository, this.outfitCatalog);
	}

	get outfitDeleter(): OutfitDeleter {
		return new OutfitDeleter(this.outfitRepository);
	}

	get outfitFinder(): OutfitFinder {
		return new OutfitFinder(this.outfitRepository);
	}

	get outfitsLister(): OutfitsLister {
		return new OutfitsLister(this.outfitRepository);
	}

	get productOutfitsFinder(): ProductOutfitsFinder {
		return new ProductOutfitsFinder(this.outfitRepository);
	}

	get productsByIdsSearcher(): ProductsByIdsSearcher {
		return new ProductsByIdsSearcher(this.productRepository);
	}

	get productsSearcher(): ProductsSearcher {
		return new ProductsSearcher(this.productRepository);
	}

	get productFinder(): ProductFinder {
		return new ProductFinder(this.productRepository);
	}

	get relatedProductsFinder(): RelatedProductsFinder {
		return new RelatedProductsFinder(this.productRepository);
	}

	get categoriesLister(): CategoriesLister {
		return new CategoriesLister(this.productRepository);
	}

	get collectionsLister(): CollectionsLister {
		return new CollectionsLister(this.productRepository);
	}

	get inventoryLister(): InventoryLister {
		return new InventoryLister(this.productRepository);
	}

	get lowStockLister(): LowStockLister {
		return new LowStockLister(this.productRepository);
	}

	get variantsSearcher(): VariantsSearcher {
		return new VariantsSearcher(this.productRepository);
	}

	get stockDecreaser(): StockDecreaser {
		return new StockDecreaser(this.productRepository);
	}

	private get customerDirectory(): UsersCustomerDirectory {
		return new UsersCustomerDirectory(this.usersByIdsSearcher);
	}

	get orderPlacer(): OrderPlacer {
		return new OrderPlacer(
			this.orderRepository,
			this.idGenerator,
			this.clock,
		);
	}

	get ordersLister(): OrdersLister {
		return new OrdersLister(this.orderRepository, this.customerDirectory);
	}

	get recentOrdersLister(): RecentOrdersLister {
		return new RecentOrdersLister(
			this.orderRepository,
			this.customerDirectory,
		);
	}

	get ordersSummaryGetter(): OrdersSummaryGetter {
		return new OrdersSummaryGetter(this.orderRepository);
	}

	get userOrdersLister(): UserOrdersLister {
		return new UserOrdersLister(
			this.orderRepository,
			this.currentUserProviderInstance,
		);
	}

	get orderFinder(): OrderFinder {
		return new OrderFinder(this.orderRepository, this.customerDirectory);
	}

	get userOrderFinder(): UserOrderFinder {
		return new UserOrderFinder(
			this.orderFinder,
			this.currentUserProviderInstance,
		);
	}

	private get checkoutCatalog(): ProductsCheckoutCatalog {
		return new ProductsCheckoutCatalog(this.variantsSearcher);
	}

	get cartVariantAdder(): CartVariantAdder {
		return new CartVariantAdder(
			this.checkoutRepository,
			this.checkoutCatalog,
			this.currentUserProviderInstance,
			this.idGenerator,
		);
	}

	get cartVariantRemover(): CartVariantRemover {
		return new CartVariantRemover(
			this.checkoutRepository,
			this.currentUserProviderInstance,
		);
	}

	get cartItemCounter(): CartItemCounter {
		return new CartItemCounter(
			this.checkoutRepository,
			this.currentUserProviderInstance,
		);
	}

	get checkoutViewGetter(): CheckoutViewGetter {
		return new CheckoutViewGetter(
			this.checkoutRepository,
			this.checkoutCatalog,
			this.currentUserProviderInstance,
		);
	}

	get checkoutConfirmer(): CheckoutConfirmer {
		return new CheckoutConfirmer(
			this.checkoutRepository,
			this.checkoutCatalog,
			new ProductsStockReserver(this.stockDecreaser),
			new OrdersOrderPlacement(this.orderPlacer),
			this.currentUserProviderInstance,
			this.unitOfWork,
		);
	}

	get currentUserGetter(): CurrentUserGetter {
		return new CurrentUserGetter(
			this.currentUserProviderInstance,
			this.userRepository,
		);
	}

	get usersByIdsSearcher(): UsersByIdsSearcher {
		return new UsersByIdsSearcher(this.userRepository);
	}

	get currentUserProvider(): CurrentUserProvider {
		return this.currentUserProviderInstance;
	}
}

export const retailContainer = new RetailContainer();
