using Microsoft.EntityFrameworkCore;
using Ecommerce.Domain.Enums;
using Ecommerce.Infrastructure.Persistence;
using Ecommerce.Infrastructure.Services;
using Ecommerce.Modules.Catalog.Contracts;
using Ecommerce.Modules.Customers.Contracts;
using Ecommerce.Modules.Inventory.Contracts;
using Ecommerce.Modules.Orders.Contracts;
using Ecommerce.Modules.Payments.Contracts;

namespace Ecommerce.UnitTests.Modules;

public class OrdersModuleTests
{
    private static EcommerceDbContext CreateInMemoryDbContext()
    {
        var options = new DbContextOptionsBuilder<EcommerceDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .ConfigureWarnings(w => w.Ignore(Microsoft.EntityFrameworkCore.Diagnostics.InMemoryEventId.TransactionIgnoredWarning))
            .Options;

        return new EcommerceDbContext(options);
    }

    [Fact]
    public async Task CheckoutAsync_CalculatesInsideDhakaShipping_Correctly()
    {
        var db = CreateInMemoryDbContext();
        var catalog = new CatalogModule(db);
        var inventory = new InventoryModule(db);
        var customers = new CustomersModule(db);
        var payments = new PaymentsModule(db);
        var orders = new OrdersModule(db, catalog, inventory, customers, payments);

        // Setup a product in catalog
        var productId = await catalog.CreateProductAsync(new CreateProductCommand(
            "Test T-Shirt",
            "test-tshirt",
            500.00m,
            null,
            "Description",
            null,
            false,
            [new CreateVariantDto("TSH-BLK-M", "Medium Black", 0, 50)],
            []
        ));

        var product = await catalog.GetProductByIdAsync(productId);
        Assert.NotNull(product);
        var variantId = product.Variants[0].Id;

        // Checkout Inside Dhaka (Subtotal = 1000 < 2000 => Shipping = 60)
        var command = new CreateOrderCommand(
            [new OrderItemRequest(variantId, 2)],
            "Ashraful Islam",
            "01712345678",
            "ashraful@example.com",
            "House 12, Road 5, Dhanmondi",
            "Dhaka",
            "Dhaka Division",
            "1209",
            PaymentMethod.CashOnDelivery
        );

        var result = await orders.CheckoutAsync(command);

        Assert.True(result.Success);
        Assert.Equal(1060.00m, result.TotalAmount); // 1000 + 60

        var order = await orders.GetOrderByIdAsync(result.OrderId!.Value);
        Assert.NotNull(order);
        Assert.Equal(60.00m, order.ShippingFee);
        Assert.Equal(1000.00m, order.SubTotal);
    }

    [Fact]
    public async Task CheckoutAsync_AppliesFreeShipping_WhenSubtotalExceeds2000()
    {
        var db = CreateInMemoryDbContext();
        var catalog = new CatalogModule(db);
        var inventory = new InventoryModule(db);
        var customers = new CustomersModule(db);
        var payments = new PaymentsModule(db);
        var orders = new OrdersModule(db, catalog, inventory, customers, payments);

        var productId = await catalog.CreateProductAsync(new CreateProductCommand(
            "Premium Headphones",
            "premium-headphones",
            2500.00m,
            null,
            "Description",
            null,
            false,
            [new CreateVariantDto("HD-BLK", "Black", 0, 20)],
            []
        ));

        var product = await catalog.GetProductByIdAsync(productId);
        var variantId = product!.Variants[0].Id;

        // Checkout Outside Dhaka with Subtotal 2500 >= 2000 => Shipping should be 0 (Free)
        var command = new CreateOrderCommand(
            [new OrderItemRequest(variantId, 1)],
            "Sayem Khan",
            "01812345678",
            null,
            "GEC Circle",
            "Chattogram",
            "Chattogram Division",
            "4000",
            PaymentMethod.CashOnDelivery
        );

        var result = await orders.CheckoutAsync(command);

        Assert.True(result.Success);
        Assert.Equal(2500.00m, result.TotalAmount); // 2500 + 0

        var order = await orders.GetOrderByIdAsync(result.OrderId!.Value);
        Assert.NotNull(order);
        Assert.Equal(0.00m, order.ShippingFee);
    }

    [Fact]
    public async Task UpdateOrderStatusAsync_PreventsCancellation_OfDeliveredOrders()
    {
        var db = CreateInMemoryDbContext();
        var catalog = new CatalogModule(db);
        var inventory = new InventoryModule(db);
        var customers = new CustomersModule(db);
        var payments = new PaymentsModule(db);
        var orders = new OrdersModule(db, catalog, inventory, customers, payments);

        var productId = await catalog.CreateProductAsync(new CreateProductCommand(
            "Item", "item", 100m, null, null, null, false,
            [new CreateVariantDto("SKU-1", "V1", 0, 10)], []
        ));

        var product = await catalog.GetProductByIdAsync(productId);
        var variantId = product!.Variants[0].Id;

        var result = await orders.CheckoutAsync(new CreateOrderCommand(
            [new OrderItemRequest(variantId, 1)],
            "Customer", "01700000000", null, "Addr", "City", "Div", null, PaymentMethod.CashOnDelivery
        ));

        var orderId = result.OrderId!.Value;

        // Mark as Delivered
        await orders.UpdateOrderStatusAsync(orderId, OrderStatus.Processing, null);
        await orders.UpdateOrderStatusAsync(orderId, OrderStatus.Shipped, null);
        await orders.UpdateOrderStatusAsync(orderId, OrderStatus.Delivered, null);

        // Attempt to Cancel
        var cancelResult = await orders.UpdateOrderStatusAsync(orderId, OrderStatus.Cancelled, "Customer changed mind");

        Assert.False(cancelResult.Success);
        Assert.Equal(OrderStatus.Delivered, cancelResult.Status);
        Assert.Contains("Delivered orders cannot be cancelled", cancelResult.Message, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public async Task CancelOrderAsCustomerAsync_Succeeds_WhenPendingPayment_AndReleasesStock()
    {
        var db = CreateInMemoryDbContext();
        var catalog = new CatalogModule(db);
        var inventory = new InventoryModule(db);
        var customers = new CustomersModule(db);
        var payments = new PaymentsModule(db);
        var orders = new OrdersModule(db, catalog, inventory, customers, payments);

        var productId = await catalog.CreateProductAsync(new CreateProductCommand(
            "Cancelable Item", "cancelable-item", 400m, null, null, null, false,
            [new CreateVariantDto("CAN-01", "V1", 0, 10)], []
        ));

        var product = await catalog.GetProductByIdAsync(productId);
        var variantId = product!.Variants[0].Id;

        // Stock was 10 initially
        var checkout = await orders.CheckoutAsync(new CreateOrderCommand(
            [new OrderItemRequest(variantId, 3)],
            "Tanvir Hasan", "01711223344", null, "Uttara", "Dhaka", "Dhaka", null, PaymentMethod.CashOnDelivery
        ));

        Assert.True(checkout.Success);
        // Stock should be 7 now
        var stockAfterCheckout = await inventory.CheckAvailabilityAsync(variantId, 8);
        Assert.False(stockAfterCheckout); // 8 is not available, only 7 is

        // Customer cancels order
        var cancelResult = await orders.CancelOrderAsCustomerAsync(checkout.OrderNumber!, "01711223344", "Changed mind");
        Assert.True(cancelResult.Success);
        Assert.Equal(OrderStatus.Cancelled, cancelResult.Status);

        // Stock must be restored back to 10
        var stockRestored = await inventory.CheckAvailabilityAsync(variantId, 10);
        Assert.True(stockRestored);

        // Payment status must be Failed
        var payment = await payments.GetPaymentByOrderIdAsync(checkout.OrderId!.Value);
        Assert.NotNull(payment);
        Assert.Equal(PaymentStatus.Failed, payment.Status);
    }

    [Fact]
    public async Task CancelOrderAsCustomerAsync_Rejects_WhenOrderIsProcessing()
    {
        var db = CreateInMemoryDbContext();
        var catalog = new CatalogModule(db);
        var inventory = new InventoryModule(db);
        var customers = new CustomersModule(db);
        var payments = new PaymentsModule(db);
        var orders = new OrdersModule(db, catalog, inventory, customers, payments);

        var productId = await catalog.CreateProductAsync(new CreateProductCommand(
            "Item", "item-2", 300m, null, null, null, false,
            [new CreateVariantDto("ITM-02", "V2", 0, 10)], []
        ));

        var product = await catalog.GetProductByIdAsync(productId);
        var variantId = product!.Variants[0].Id;

        var checkout = await orders.CheckoutAsync(new CreateOrderCommand(
            [new OrderItemRequest(variantId, 1)],
            "Tanvir", "01799887766", null, "Mirpur", "Dhaka", "Dhaka", null, PaymentMethod.CashOnDelivery
        ));

        // Merchant confirms order and moves to Processing
        await orders.UpdateOrderStatusAsync(checkout.OrderId!.Value, OrderStatus.Processing, "Confirmed with customer");

        // Customer attempts self-cancellation
        var cancelResult = await orders.CancelOrderAsCustomerAsync(checkout.OrderNumber!, "01799887766", "Cancel please");
        Assert.False(cancelResult.Success);
        Assert.Contains("cannot be cancelled online", cancelResult.Message, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public async Task UpdateOrderStatusAsync_Delivered_MarksCodPaymentAsPaid()
    {
        var db = CreateInMemoryDbContext();
        var catalog = new CatalogModule(db);
        var inventory = new InventoryModule(db);
        var customers = new CustomersModule(db);
        var payments = new PaymentsModule(db);
        var orders = new OrdersModule(db, catalog, inventory, customers, payments);

        var productId = await catalog.CreateProductAsync(new CreateProductCommand(
            "Item", "item-3", 750m, null, null, null, false,
            [new CreateVariantDto("COD-03", "V3", 0, 10)], []
        ));

        var product = await catalog.GetProductByIdAsync(productId);
        var variantId = product!.Variants[0].Id;

        var checkout = await orders.CheckoutAsync(new CreateOrderCommand(
            [new OrderItemRequest(variantId, 1)],
            "Fahim", "01733445566", null, "Banani", "Dhaka", "Dhaka", null, PaymentMethod.CashOnDelivery
        ));

        var paymentBefore = await payments.GetPaymentByOrderIdAsync(checkout.OrderId!.Value);
        Assert.NotNull(paymentBefore);
        Assert.Equal(PaymentStatus.Pending, paymentBefore.Status);

        // Transition through Processing -> Shipped -> Delivered
        await orders.UpdateOrderStatusAsync(checkout.OrderId!.Value, OrderStatus.Processing, null);
        await orders.UpdateOrderStatusAsync(checkout.OrderId!.Value, OrderStatus.Shipped, "Pathao consignment #9821");
        await orders.UpdateOrderStatusAsync(checkout.OrderId!.Value, OrderStatus.Delivered, "Delivered and cash collected");

        var paymentAfter = await payments.GetPaymentByOrderIdAsync(checkout.OrderId!.Value);
        Assert.NotNull(paymentAfter);
        Assert.Equal(PaymentStatus.Paid, paymentAfter.Status);
    }
}
