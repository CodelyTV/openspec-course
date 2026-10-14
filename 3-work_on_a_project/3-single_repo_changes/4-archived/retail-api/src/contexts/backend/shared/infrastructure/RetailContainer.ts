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
import { ProductPurchaseChecker } from "@/contexts/backend/orders/application/check-purchase/ProductPurchaseChecker";
import { OrderFinder } from "@/contexts/backend/orders/application/find/OrderFinder";
import { UserOrderFinder } from "@/contexts/backend/orders/application/find-mine/UserOrderFinder";
import { OrdersLister } from "@/contexts/backend/orders/application/list/OrdersLister";
import { UserOrdersLister } from "@/contexts/backend/orders/application/list-mine/UserOrdersLister";
import { RecentOrdersLister } from "@/contexts/backend/orders/application/list-recent/RecentOrdersLister";
import { OrderPlacer } from "@/contexts/backend/orders/application/place/OrderPlacer";
import { OrdersSummaryGetter } from "@/contexts/backend/orders/application/summarize/OrdersSummaryGetter";
import { PostgresOrderRepository } from "@/contexts/backend/orders/infrastructure/PostgresOrderRepository";
import { UsersCustomerDirectory } from "@/contexts/backend/orders/infrastructure/UsersCustomerDirectory";
import { CategoriesLister } from "@/contexts/backend/products/application/categories/CategoriesLister";
import { CollectionsLister } from "@/contexts/backend/products/application/collections/CollectionsLister";
import { OutfitCreator } from "@/contexts/backend/products/application/create-outfit/OutfitCreator";
import { StockDecreaser } from "@/contexts/backend/products/application/decrease-stock/StockDecreaser";
import { OutfitDeleter } from "@/contexts/backend/products/application/delete-outfit/OutfitDeleter";
import { ProductFinder } from "@/contexts/backend/products/application/find/ProductFinder";
import { OutfitFinder } from "@/contexts/backend/products/application/find-outfit/OutfitFinder";
import { ProductSuggestionsFinder } from "@/contexts/backend/products/application/find-suggestions/ProductSuggestionsFinder";
import { InventoryLister } from "@/contexts/backend/products/application/inventory/InventoryLister";
import { OutfitsLister } from "@/contexts/backend/products/application/list-outfits/OutfitsLister";
import { LowStockLister } from "@/contexts/backend/products/application/low-stock/LowStockLister";
import { ProductsSearcher } from "@/contexts/backend/products/application/search/ProductsSearcher";
import { VariantsSearcher } from "@/contexts/backend/products/application/search-variants/VariantsSearcher";
import { OutfitUpdater } from "@/contexts/backend/products/application/update-outfit/OutfitUpdater";
import { PostgresOutfitRepository } from "@/contexts/backend/products/infrastructure/PostgresOutfitRepository";
import { PostgresProductRepository } from "@/contexts/backend/products/infrastructure/PostgresProductRepository";
import { ReviewApprover } from "@/contexts/backend/reviews/application/approve/ReviewApprover";
import { ReviewEligibilityChecker } from "@/contexts/backend/reviews/application/check-eligibility/ReviewEligibilityChecker";
import { ProductReviewsGetter } from "@/contexts/backend/reviews/application/get-product-reviews/ProductReviewsGetter";
import { PendingReviewsLister } from "@/contexts/backend/reviews/application/list-pending/PendingReviewsLister";
import { ReviewRejecter } from "@/contexts/backend/reviews/application/reject/ReviewRejecter";
import { ReviewSubmitter } from "@/contexts/backend/reviews/application/submit/ReviewSubmitter";
import { OrdersPurchaseHistory } from "@/contexts/backend/reviews/infrastructure/OrdersPurchaseHistory";
import { PostgresReviewRepository } from "@/contexts/backend/reviews/infrastructure/PostgresReviewRepository";
import { ProductsReviewedProducts } from "@/contexts/backend/reviews/infrastructure/ProductsReviewedProducts";
import { UsersReviewerDirectory } from "@/contexts/backend/reviews/infrastructure/UsersReviewerDirectory";
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

	private readonly productRepository = new PostgresProductRepository(
		this.connection,
	);

	private readonly outfitRepository = new PostgresOutfitRepository(
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

	private readonly reviewRepository = new PostgresReviewRepository(
		this.connection,
	);

	private readonly unitOfWork = new PostgresUnitOfWork(this.connection);

	private readonly idGenerator = new CryptoIdGenerator();

	private readonly clock = new SystemClock();

	private readonly currentUserProviderInstance =
		new FakeSessionCurrentUserProvider();

	get productsSearcher(): ProductsSearcher {
		return new ProductsSearcher(this.productRepository);
	}

	get productFinder(): ProductFinder {
		return new ProductFinder(this.productRepository);
	}

	get productSuggestionsFinder(): ProductSuggestionsFinder {
		return new ProductSuggestionsFinder(
			this.outfitRepository,
			this.productRepository,
		);
	}

	get categoriesLister(): CategoriesLister {
		return new CategoriesLister(this.productRepository);
	}

	get collectionsLister(): CollectionsLister {
		return new CollectionsLister(this.productRepository);
	}

	get inventoryLister(): InventoryLister {
		return new InventoryLister(
			this.productRepository,
			this.outfitRepository,
		);
	}

	get lowStockLister(): LowStockLister {
		return new LowStockLister(
			this.productRepository,
			this.outfitRepository,
		);
	}

	get variantsSearcher(): VariantsSearcher {
		return new VariantsSearcher(this.productRepository);
	}

	get stockDecreaser(): StockDecreaser {
		return new StockDecreaser(this.productRepository);
	}

	get outfitsLister(): OutfitsLister {
		return new OutfitsLister(this.outfitRepository, this.productRepository);
	}

	get outfitFinder(): OutfitFinder {
		return new OutfitFinder(this.outfitRepository);
	}

	get outfitCreator(): OutfitCreator {
		return new OutfitCreator(
			this.outfitRepository,
			this.productRepository,
			this.idGenerator,
		);
	}

	get outfitUpdater(): OutfitUpdater {
		return new OutfitUpdater(this.outfitRepository, this.productRepository);
	}

	get outfitDeleter(): OutfitDeleter {
		return new OutfitDeleter(this.outfitRepository);
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

	get productPurchaseChecker(): ProductPurchaseChecker {
		return new ProductPurchaseChecker(this.orderRepository);
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

	private get purchaseHistory(): OrdersPurchaseHistory {
		return new OrdersPurchaseHistory(this.productPurchaseChecker);
	}

	private get reviewerDirectory(): UsersReviewerDirectory {
		return new UsersReviewerDirectory(this.usersByIdsSearcher);
	}

	get reviewSubmitter(): ReviewSubmitter {
		return new ReviewSubmitter(
			this.reviewRepository,
			this.purchaseHistory,
			new ProductsReviewedProducts(this.productFinder),
			this.currentUserProviderInstance,
			this.idGenerator,
			this.clock,
		);
	}

	get reviewEligibilityChecker(): ReviewEligibilityChecker {
		return new ReviewEligibilityChecker(
			this.reviewRepository,
			this.purchaseHistory,
			this.currentUserProviderInstance,
		);
	}

	get productReviewsGetter(): ProductReviewsGetter {
		return new ProductReviewsGetter(
			this.reviewRepository,
			this.reviewerDirectory,
		);
	}

	get pendingReviewsLister(): PendingReviewsLister {
		return new PendingReviewsLister(
			this.reviewRepository,
			this.reviewerDirectory,
		);
	}

	get reviewApprover(): ReviewApprover {
		return new ReviewApprover(this.reviewRepository);
	}

	get reviewRejecter(): ReviewRejecter {
		return new ReviewRejecter(this.reviewRepository);
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
