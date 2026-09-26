using Ecommerce.Domain.Enums;
using Ecommerce.Infrastructure.Persistence;
using Ecommerce.Infrastructure.Services;
using Ecommerce.Modules.Catalog.Contracts;
using Ecommerce.Modules.Customers.Contracts;
using Ecommerce.Modules.Inventory.Contracts;
using Ecommerce.Modules.Orders.Contracts;
using Ecommerce.Modules.Payments.Contracts;
using Microsoft.EntityFrameworkCore;

namespace Ecommerce.UnitTests.Integration;

public class ApiValidationIntegrationTests
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
    public async Task EndToEnd_CheckoutToOrderCompletion_WithPaymentVerification_PreservesAllInvariants()
    {
        // 1. Arrange In-Memory Modular Monolith Services
        var db = CreateInMemoryDbContext();
        var catalog = new CatalogModule(db);
        var inventory = new InventoryModule(db);
        var customers = new CustomersModule(db);
        var payments = new PaymentsModule(db);
        var orders = new OrdersModule(db, catalog, inventory, customers, payments);

        // 2. Setup Catalog with Product and Variant
        var productId = await catalog.CreateProductAsync(new CreateProductCommand(
            "Premium Panjabi",
            "premium-panjabi",
            2500.00m,
            3000.00m,
            "Luxury Silk Panjabi",
            null,
            true,
            [new CreateVariantDto("PANJ-L", "Size Large", 200.00m, 20)],
            []
        ));

        var product = await catalog.GetProductByIdAsync(productId);
        Assert.NotNull(product);
        var variant = product.Variants[0];

        // Check initial stock
        var stockBefore = await inventory.CheckAvailabilityAsync(variant.Id, 2);
        Assert.True(stockBefore);

        // 3. Act: Execute Customer Checkout (Free shipping because 2 * 2700 = 5400 >= 2000)
        var checkoutCommand = new CreateOrderCommand(
            [new OrderItemRequest(variant.Id, 2)],
            "Rafiqul Hasan",
            "01819283746",
            "rafiq@example.com",
            "Gulshan 2, Road 45, House 10",
            "Dhaka",
            "Dhaka Division",
            "1212",
            PaymentMethod.Bkash,
            "01819283746",
            "BKASH-TRX-998877",
            "Deliver after 5 PM"
        );

        var orderResult = await orders.CheckoutAsync(checkoutCommand);
        Assert.True(orderResult.Success);
        Assert.NotNull(orderResult.OrderNumber);
        Assert.NotNull(orderResult.OrderId);
        Assert.Equal(5400.00m, orderResult.TotalAmount);

        // 4. Verify Stock Deduction (2 units reserved/deducted)
        var stockLevels = await inventory.ListStockLevelsAsync();
        var variantStock = stockLevels.First(s => s.VariantId == variant.Id);
        Assert.Equal(18, variantStock.AvailableQuantity); // 20 - 2

        // 5. Admin: Verify Payment TrxID
        var payment = await db.Payments.FirstOrDefaultAsync(p => p.OrderId == orderResult.OrderId.Value);
        Assert.NotNull(payment);

        var verifyResult = await payments.VerifyManualPaymentAsync(payment.Id, true, "bKash TrxID verified with statement.");
        Assert.True(verifyResult.Success);
        Assert.Equal(PaymentStatus.Paid, verifyResult.Status);

        // Order transitions to Processing upon verification
        await orders.UpdateOrderStatusAsync(orderResult.OrderId.Value, OrderStatus.Processing, "Payment verified by admin.");

        // Customer tracks order
        var trackedOrder = await orders.GetOrderByOrderNumberAsync(orderResult.OrderNumber, "01819283746");
        Assert.NotNull(trackedOrder);
        Assert.Equal(OrderStatus.Processing, trackedOrder.Status);
        Assert.Equal(PaymentStatus.Paid, trackedOrder.Payment?.Status);
    }
}
