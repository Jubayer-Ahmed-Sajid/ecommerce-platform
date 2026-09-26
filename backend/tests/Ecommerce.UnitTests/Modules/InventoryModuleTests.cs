using Microsoft.EntityFrameworkCore;
using Ecommerce.Infrastructure.Persistence;
using Ecommerce.Infrastructure.Services;
using Ecommerce.Modules.Inventory.Contracts;
using Ecommerce.Modules.Inventory.Domain;

namespace Ecommerce.UnitTests.Modules;

public class InventoryModuleTests
{
    private static EcommerceDbContext CreateInMemoryDbContext()
    {
        var options = new DbContextOptionsBuilder<EcommerceDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        return new EcommerceDbContext(options);
    }

    [Fact]
    public async Task CheckAvailabilityAsync_ReturnsTrue_WhenStockIsSufficient()
    {
        var db = CreateInMemoryDbContext();
        var inventory = new InventoryModule(db);

        var variantId = Guid.NewGuid();
        db.StockItems.Add(new StockItem(variantId, 10));
        await db.SaveChangesAsync();

        var isAvailable = await inventory.CheckAvailabilityAsync(variantId, 5);

        Assert.True(isAvailable);
    }

    [Fact]
    public async Task CheckAvailabilityAsync_ReturnsFalse_WhenStockIsInsufficient()
    {
        var db = CreateInMemoryDbContext();
        var inventory = new InventoryModule(db);

        var variantId = Guid.NewGuid();
        db.StockItems.Add(new StockItem(variantId, 3));
        await db.SaveChangesAsync();

        var isAvailable = await inventory.CheckAvailabilityAsync(variantId, 5);

        Assert.False(isAvailable);
    }

    [Fact]
    public async Task DeductStockAsync_DecrementsStock_AndCreatesAuditLog()
    {
        var db = CreateInMemoryDbContext();
        var inventory = new InventoryModule(db);

        var variantId = Guid.NewGuid();
        var stock = new StockItem(variantId, 20);
        db.StockItems.Add(stock);
        await db.SaveChangesAsync();

        var orderId = Guid.NewGuid();
        var result = await inventory.DeductStockAsync(orderId, [new StockDeductionItem(variantId, 4)]);

        Assert.True(result.Success);

        var updatedStock = await db.StockItems.Include(s => s.Logs).FirstAsync(s => s.VariantId == variantId);
        Assert.Equal(16, updatedStock.AvailableQuantity);
        Assert.Single(updatedStock.Logs);
        Assert.Equal(-4, updatedStock.Logs.First().QuantityChange);
    }

    [Fact]
    public async Task ReleaseStockAsync_RestoresStock_AfterCancellation()
    {
        var db = CreateInMemoryDbContext();
        var inventory = new InventoryModule(db);

        var variantId = Guid.NewGuid();
        var stock = new StockItem(variantId, 10);
        db.StockItems.Add(stock);
        await db.SaveChangesAsync();

        var orderId = Guid.NewGuid();
        await inventory.DeductStockAsync(orderId, [new StockDeductionItem(variantId, 3)]);
        await inventory.ReleaseStockAsync(orderId, [new StockDeductionItem(variantId, 3)]);

        var updatedStock = await db.StockItems.FirstAsync(s => s.VariantId == variantId);
        Assert.Equal(10, updatedStock.AvailableQuantity);
    }
}
