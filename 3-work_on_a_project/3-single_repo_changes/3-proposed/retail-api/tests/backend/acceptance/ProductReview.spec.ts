import { faker } from "@faker-js/faker";
import { beforeEach, expect, it, vi } from "vitest";

import { ProductPurchaseChecker } from "@/contexts/backend/orders/application/check-purchase/ProductPurchaseChecker";
import { OrderPlacer } from "@/contexts/backend/orders/application/place/OrderPlacer";
import { PostgresOrderRepository } from "@/contexts/backend/orders/infrastructure/PostgresOrderRepository";
import { ProductFinder } from "@/contexts/backend/products/application/find/ProductFinder";
import { PostgresProductRepository } from "@/contexts/backend/products/infrastructure/PostgresProductRepository";
import { ReviewApprover } from "@/contexts/backend/reviews/application/approve/ReviewApprover";
import { ProductReviewsGetter } from "@/contexts/backend/reviews/application/get-product-reviews/ProductReviewsGetter";
import { PendingReviewsLister } from "@/contexts/backend/reviews/application/list-pending/PendingReviewsLister";
import { ReviewSubmitter } from "@/contexts/backend/reviews/application/submit/ReviewSubmitter";
import { ProductNotPurchasedError } from "@/contexts/backend/reviews/domain/errors/ProductNotPurchasedError";
import { OrdersPurchaseHistory } from "@/contexts/backend/reviews/infrastructure/OrdersPurchaseHistory";
import { PostgresReviewRepository } from "@/contexts/backend/reviews/infrastructure/PostgresReviewRepository";
import { ProductsReviewedProducts } from "@/contexts/backend/reviews/infrastructure/ProductsReviewedProducts";
import { UsersReviewerDirectory } from "@/contexts/backend/reviews/infrastructure/UsersReviewerDirectory";
import { PostgresConnection } from "@/contexts/backend/shared/infrastructure/PostgresConnection";
import { UsersByIdsSearcher } from "@/contexts/backend/users/application/search-by-ids/UsersByIdsSearcher";
import { PostgresUserRepository } from "@/contexts/backend/users/infrastructure/PostgresUserRepository";
import type { Clock } from "@/contexts/shared/domain/Clock";
import type { CurrentUserProvider } from "@/contexts/shared/domain/CurrentUserProvider";
import type { IdGenerator } from "@/contexts/shared/domain/IdGenerator";

import { Mock } from "../../shared/Mock";
import { ProductMother } from "../products/domain/ProductMother";
import { ProductVariantMother } from "../products/domain/ProductVariantMother";
import { describeWithEnvironmentArranger } from "../shared/infrastructure/describeWithEnvironmentArranger";
import { RetailEnvironmentArranger } from "../shared/infrastructure/RetailEnvironmentArranger";
import { UserMother } from "../users/domain/UserMother";

const connection = new PostgresConnection();
const arranger = new RetailEnvironmentArranger(connection);
const orderRepository = new PostgresOrderRepository(connection);
const reviewRepository = new PostgresReviewRepository(connection);
const productRepository = new PostgresProductRepository(connection);
const userRepository = new PostgresUserRepository(connection);

const idGenerator = Mock.create<IdGenerator>();
const clock = Mock.create<Clock>();
const currentUserProvider = Mock.create<CurrentUserProvider>();

const orderPlacer = new OrderPlacer(orderRepository, idGenerator, clock);
const reviewerDirectory = new UsersReviewerDirectory(
	new UsersByIdsSearcher(userRepository),
);
const submitter = new ReviewSubmitter(
	reviewRepository,
	new OrdersPurchaseHistory(new ProductPurchaseChecker(orderRepository)),
	new ProductsReviewedProducts(new ProductFinder(productRepository)),
	currentUserProvider,
	idGenerator,
	clock,
);
const pendingReviewsLister = new PendingReviewsLister(
	reviewRepository,
	reviewerDirectory,
);
const approver = new ReviewApprover(reviewRepository);
const productReviewsGetter = new ProductReviewsGetter(
	reviewRepository,
	reviewerDirectory,
);

const customer = UserMother.create({ name: "Ada Lovelace" });
const hoodie = ProductMother.create({
	id: "aggregate-hoodie",
	name: "Aggregate Hoodie",
	price: { amount: 95, currency: "EUR" },
	variants: [ProductVariantMother.createPrimitives({ id: "hoodie-m" })],
});

async function givenTheCustomerBoughtTheHoodie(): Promise<void> {
	await orderPlacer.place(customer.id, "home-delivery", [
		{
			productId: hoodie.id.value,
			variantId: "hoodie-m",
			productName: hoodie.name,
			color: "Camel",
			size: "M",
			quantity: 1,
			unitPrice: { amount: 95, currency: "EUR" },
		},
	]);
}

describeWithEnvironmentArranger(
	arranger,
	"Product review across orders, products, users and reviews should",
	() => {
		beforeEach(async () => {
			vi.mocked(idGenerator.generate).mockImplementation(() =>
				faker.string.uuid(),
			);
			clock.nowShouldReturn(new Date("2026-10-13T09:00:00.000Z"));
			currentUserProvider.currentUserIdShouldReturn(customer.id);
			await arranger.givenUsers(customer);
			await arranger.givenProducts(hoodie);
		});

		it("publish the review of a buyer on the product page once staff approve it", async () => {
			await givenTheCustomerBoughtTheHoodie();

			await submitter.submit(
				hoodie.id.value,
				5,
				"Coziest hoodie I own",
				"Brushed interior and a roomy fit.",
			);

			expect(
				(await productReviewsGetter.get(hoodie.id.value)).reviewCount,
			).toBe(0);
			const [pending] = await pendingReviewsLister.list();
			expect(pending).toMatchObject({
				productName: "Aggregate Hoodie",
				authorName: "Ada Lovelace",
			});

			await approver.approve(pending.id);

			expect(await productReviewsGetter.get(hoodie.id.value)).toEqual({
				averageRating: 5,
				reviewCount: 1,
				reviews: [
					{
						id: pending.id,
						rating: 5,
						title: "Coziest hoodie I own",
						body: "Brushed interior and a roomy fit.",
						authorName: "Ada Lovelace",
						createdAt: "2026-10-13T09:00:00.000Z",
					},
				],
			});
			expect(await pendingReviewsLister.list()).toEqual([]);
		});

		it("not accept a review from a customer who never bought the product", async () => {
			await expect(
				submitter.submit(
					hoodie.id.value,
					5,
					"Coziest hoodie I own",
					"Brushed interior and a roomy fit.",
				),
			).rejects.toBeInstanceOf(ProductNotPurchasedError);
			expect(await pendingReviewsLister.list()).toEqual([]);
		});
	},
);
