import { beforeEach, describe, expect, it, vi } from "vitest";

import { CheckoutConfirmer } from "@/contexts/backend/checkout/application/confirm/CheckoutConfirmer";
import type { Checkout } from "@/contexts/backend/checkout/domain/Checkout";
import type { CheckoutCatalog } from "@/contexts/backend/checkout/domain/CheckoutCatalog";
import type { CheckoutRepository } from "@/contexts/backend/checkout/domain/CheckoutRepository";
import { CatalogItemNotFoundError } from "@/contexts/backend/checkout/domain/errors/CatalogItemNotFoundError";
import { EmptyCheckoutError } from "@/contexts/backend/checkout/domain/errors/EmptyCheckoutError";
import { VariantOutOfStockError } from "@/contexts/backend/checkout/domain/errors/VariantOutOfStockError";
import type { OrderPlacement } from "@/contexts/backend/checkout/domain/OrderPlacement";
import type { StockReserver } from "@/contexts/backend/checkout/domain/StockReserver";
import type { CurrentUserProvider } from "@/contexts/shared/domain/CurrentUserProvider";
import type { UnitOfWork } from "@/contexts/shared/domain/UnitOfWork";
import { UserId } from "@/contexts/shared/domain/UserId";
import { VariantId } from "@/contexts/shared/domain/VariantId";

import { MoneyMother } from "../../../../shared/domain/MoneyMother";
import { Mock } from "../../../../shared/Mock";
import { CatalogItemMother } from "../../domain/CatalogItemMother";
import { CheckoutMother } from "../../domain/CheckoutMother";

describe("CheckoutConfirmer should", () => {
	const checkoutRepository = Mock.create<CheckoutRepository>();
	const catalog = Mock.create<CheckoutCatalog>();
	const stockReserver = Mock.create<StockReserver>();
	const orderPlacement = Mock.create<OrderPlacement>();
	const currentUserProvider = Mock.create<CurrentUserProvider>();
	const unitOfWork = Mock.create<UnitOfWork>();
	const confirmer = new CheckoutConfirmer(
		checkoutRepository,
		catalog,
		stockReserver,
		orderPlacement,
		currentUserProvider,
		unitOfWork,
	);
	const userId = new UserId("user-aibuilder");

	const item = CatalogItemMother.create({
		productId: "p1",
		variantId: "v1",
		productName: "Hoodie",
		color: "Ecru",
		size: "L",
		unitPrice: { amount: 50, currency: "EUR" },
	});

	function cartWith(
		productId: string,
		variantId: string,
		quantity = 2,
	): Checkout {
		return CheckoutMother.create({
			userId: userId.value,
			deliveryMethod: "store-pickup",
			lines: [{ productId, variantId, quantity }],
		});
	}

	beforeEach(() => {
		currentUserProvider.currentUserIdShouldReturn(userId);
		vi.mocked(unitOfWork.run).mockImplementation((work) => work());
	});

	it("place an order snapshotting current prices, reserve the stock and empty the cart", async () => {
		const checkout = cartWith("p1", "v1", 2);
		checkoutRepository.searchByUserLockingItShouldReturn(checkout);
		catalog.searchItemsShouldReturn([item]);
		orderPlacement.placeShouldReturn("order-xyz");

		const orderId = await confirmer.confirm();

		expect(orderId).toBe("order-xyz");
		catalog.expectSearchItemsToHaveBeenCalledWith([new VariantId("v1")]);
		stockReserver.expectReserveToHaveBeenCalledWith(checkout.lines);
		orderPlacement.expectPlaceToHaveBeenCalledWith(userId, "store-pickup", [
			{
				productId: "p1",
				variantId: new VariantId("v1"),
				productName: "Hoodie",
				color: "Ecru",
				size: "L",
				quantity: 2,
				unitPrice: MoneyMother.create({ amount: 50, currency: "EUR" }),
			},
		]);
		checkoutRepository.expectSaveToHaveBeenCalledWith(checkout.clear());
	});

	it("lock the cart, reserve the stock, place the order and empty the cart only within the unit of work", async () => {
		vi.mocked(unitOfWork.run).mockResolvedValue("order-from-unit-of-work");

		expect(await confirmer.confirm()).toBe("order-from-unit-of-work");
		checkoutRepository.expectSearchByUserLockingItNotToHaveBeenCalled();
		stockReserver.expectReserveNotToHaveBeenCalled();
		orderPlacement.expectPlaceNotToHaveBeenCalled();
		checkoutRepository.expectSaveNotToHaveBeenCalled();
	});

	it("fail and place no order when the user has no cart", async () => {
		checkoutRepository.searchByUserLockingItShouldReturn(null);

		await expect(confirmer.confirm()).rejects.toBeInstanceOf(
			EmptyCheckoutError,
		);
		orderPlacement.expectPlaceNotToHaveBeenCalled();
	});

	it("fail and place no order when the cart is empty, as a repeated submit finds it", async () => {
		checkoutRepository.searchByUserLockingItShouldReturn(
			CheckoutMother.create({ userId: userId.value, lines: [] }),
		);

		await expect(confirmer.confirm()).rejects.toBeInstanceOf(
			EmptyCheckoutError,
		);
		orderPlacement.expectPlaceNotToHaveBeenCalled();
		stockReserver.expectReserveNotToHaveBeenCalled();
	});

	it("fail instead of dropping a line whose item is no longer in the catalog", async () => {
		checkoutRepository.searchByUserLockingItShouldReturn(
			cartWith("p1", "ghost-variant"),
		);
		catalog.searchItemsShouldReturn([item]);

		await expect(confirmer.confirm()).rejects.toBeInstanceOf(
			CatalogItemNotFoundError,
		);
		orderPlacement.expectPlaceNotToHaveBeenCalled();
		stockReserver.expectReserveNotToHaveBeenCalled();
		checkoutRepository.expectSaveNotToHaveBeenCalled();
	});

	it("fail, place no order and keep the cart when there is not enough stock left", async () => {
		checkoutRepository.searchByUserLockingItShouldReturn(
			cartWith("p1", "v1"),
		);
		catalog.searchItemsShouldReturn([item]);
		vi.mocked(stockReserver.reserve).mockRejectedValue(
			new VariantOutOfStockError("v1"),
		);

		await expect(confirmer.confirm()).rejects.toBeInstanceOf(
			VariantOutOfStockError,
		);
		orderPlacement.expectPlaceNotToHaveBeenCalled();
		checkoutRepository.expectSaveNotToHaveBeenCalled();
	});
});
