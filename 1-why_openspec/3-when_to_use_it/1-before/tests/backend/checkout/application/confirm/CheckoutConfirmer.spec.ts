import { beforeEach, describe, expect, it, vi } from "vitest";

import { CheckoutConfirmer } from "@/contexts/backend/checkout/application/confirm/CheckoutConfirmer";
import type { Checkout } from "@/contexts/backend/checkout/domain/Checkout";
import type { CheckoutRepository } from "@/contexts/backend/checkout/domain/CheckoutRepository";
import { EmptyCheckoutError } from "@/contexts/backend/checkout/domain/errors/EmptyCheckoutError";
import { VariantOutOfStockError } from "@/contexts/backend/checkout/domain/errors/VariantOutOfStockError";
import type { OrderPlacer } from "@/contexts/backend/orders/application/place/OrderPlacer";
import { ProductNotFoundError } from "@/contexts/backend/products/domain/errors/ProductNotFoundError";
import { VariantNotFoundError } from "@/contexts/backend/products/domain/errors/VariantNotFoundError";
import { ProductId } from "@/contexts/backend/products/domain/ProductId";
import type { ProductRepository } from "@/contexts/backend/products/domain/ProductRepository";
import { VariantId } from "@/contexts/backend/products/domain/VariantId";
import type { CurrentUserProvider } from "@/contexts/backend/users/domain/CurrentUserProvider";
import { UserId } from "@/contexts/backend/users/domain/UserId";
import type { UnitOfWork } from "@/contexts/shared/domain/UnitOfWork";

import { Mock } from "../../../../shared/Mock";
import { ProductMother } from "../../../products/domain/ProductMother";
import { ProductVariantMother } from "../../../products/domain/ProductVariantMother";
import { CheckoutMother } from "../../domain/CheckoutMother";

describe("CheckoutConfirmer should", () => {
	const checkoutRepository = Mock.create<CheckoutRepository>();
	const productRepository = Mock.create<ProductRepository>();
	const orderPlacer = Mock.create<OrderPlacer>();
	const currentUserProvider = Mock.create<CurrentUserProvider>();
	const unitOfWork = Mock.create<UnitOfWork>();
	const confirmer = new CheckoutConfirmer(
		checkoutRepository,
		productRepository,
		orderPlacer,
		currentUserProvider,
		unitOfWork,
	);
	const userId = new UserId("user-aibuilder");

	const product = ProductMother.create({
		id: "p1",
		price: { amount: 50, currency: "EUR" },
		variants: [ProductVariantMother.createPrimitives({ id: "v1" })],
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
		productRepository.decreaseStockIfEnoughUnitsLeftShouldReturn(true);
	});

	it("place an order snapshotting current prices, decrease the stock and empty the cart", async () => {
		const checkout = cartWith("p1", "v1", 2);
		checkoutRepository.searchByUserLockingItShouldReturn(checkout);
		productRepository.searchByIdsShouldReturn([product]);
		orderPlacer.placeShouldReturn("order-xyz");

		const orderId = await confirmer.confirm();

		expect(orderId).toBe("order-xyz");
		productRepository.expectSearchByIdsToHaveBeenCalledWith([
			new ProductId("p1"),
		]);
		productRepository.expectDecreaseStockIfEnoughUnitsLeftToHaveBeenCalledWith(
			new VariantId("v1"),
			2,
		);
		orderPlacer.expectPlaceToHaveBeenCalledWith(userId, "store-pickup", [
			{
				productId: "p1",
				variantId: "v1",
				quantity: 2,
				unitPrice: { amount: 50, currency: "EUR" },
			},
		]);
		checkoutRepository.expectSaveToHaveBeenCalledWith(checkout.clear());
	});

	it("lock the cart, decrease the stock, place the order and empty the cart only within the unit of work", async () => {
		vi.mocked(unitOfWork.run).mockResolvedValue("order-from-unit-of-work");

		expect(await confirmer.confirm()).toBe("order-from-unit-of-work");
		checkoutRepository.expectSearchByUserLockingItNotToHaveBeenCalled();
		productRepository.expectDecreaseStockIfEnoughUnitsLeftNotToHaveBeenCalled();
		orderPlacer.expectPlaceNotToHaveBeenCalled();
		checkoutRepository.expectSaveNotToHaveBeenCalled();
	});

	it("fail and place no order when the user has no cart", async () => {
		checkoutRepository.searchByUserLockingItShouldReturn(null);

		await expect(confirmer.confirm()).rejects.toBeInstanceOf(
			EmptyCheckoutError,
		);
		orderPlacer.expectPlaceNotToHaveBeenCalled();
	});

	it("fail and place no order when the cart is empty, as a repeated submit finds it", async () => {
		checkoutRepository.searchByUserLockingItShouldReturn(
			CheckoutMother.create({ userId: userId.value, lines: [] }),
		);

		await expect(confirmer.confirm()).rejects.toBeInstanceOf(
			EmptyCheckoutError,
		);
		orderPlacer.expectPlaceNotToHaveBeenCalled();
		productRepository.expectDecreaseStockIfEnoughUnitsLeftNotToHaveBeenCalled();
	});

	it("fail instead of dropping a line whose product no longer exists", async () => {
		checkoutRepository.searchByUserLockingItShouldReturn(
			cartWith("ghost-product", "v1"),
		);
		productRepository.searchByIdsShouldReturn([]);

		await expect(confirmer.confirm()).rejects.toBeInstanceOf(
			ProductNotFoundError,
		);
		orderPlacer.expectPlaceNotToHaveBeenCalled();
		productRepository.expectDecreaseStockIfEnoughUnitsLeftNotToHaveBeenCalled();
		checkoutRepository.expectSaveNotToHaveBeenCalled();
	});

	it("fail when a line's variant no longer belongs to its product", async () => {
		checkoutRepository.searchByUserLockingItShouldReturn(
			cartWith("p1", "ghost-variant"),
		);
		productRepository.searchByIdsShouldReturn([product]);

		await expect(confirmer.confirm()).rejects.toBeInstanceOf(
			VariantNotFoundError,
		);
		orderPlacer.expectPlaceNotToHaveBeenCalled();
	});

	it("fail, place no order and keep the cart when there is not enough stock left", async () => {
		checkoutRepository.searchByUserLockingItShouldReturn(
			cartWith("p1", "v1"),
		);
		productRepository.searchByIdsShouldReturn([product]);
		productRepository.decreaseStockIfEnoughUnitsLeftShouldReturn(false);

		await expect(confirmer.confirm()).rejects.toBeInstanceOf(
			VariantOutOfStockError,
		);
		orderPlacer.expectPlaceNotToHaveBeenCalled();
		checkoutRepository.expectSaveNotToHaveBeenCalled();
	});
});
