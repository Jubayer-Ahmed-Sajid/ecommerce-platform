using Microsoft.EntityFrameworkCore;
using Ecommerce.Infrastructure.Persistence;
using Ecommerce.Modules.Inventory;
using Ecommerce.Modules.Inventory.Contracts;
using Ecommerce.Modules.Inventory.Domain;

namespace Ecommerce.Infrastructure.Services;

public class InventoryModule : IInventoryModule
{
    private readonly EcommerceDbContext _dbContext;

    public InventoryModule(EcommerceDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<bool> CheckAvailabilityAsync(Guid variantId, int requestedQuantity, CancellationToken ct = default)
    {
        if (requestedQuantity <= 0)
        {
            return false;
        }

        var stock = await _dbContext.StockItems
            .AsNoTracking()
            .FirstOrDefaultAsync(s => s.VariantId == variantId, ct);

        return stock != null && stock.AvailableQuantity >= requestedQuantity;
    }

    public async Task<InventoryReservationResult> DeductStockAsync(Guid orderId, IEnumerable<StockDeductionItem> items, CancellationToken ct = default)
    {
        var deductionItems = items.ToList();
        var variantIds = deductionItems.Select(i => i.VariantId).ToList();

        var stockItems = await _dbContext.StockItems
            .Where(s => variantIds.Contains(s.VariantId))
            .ToListAsync(ct);

        var failedIds = new List<Guid>();

        foreach (var item in deductionItems)
        {
            var stock = stockItems.FirstOrDefault(s => s.VariantId == item.VariantId);
            if (stock == null || stock.AvailableQuantity < item.Quantity)
            {
                failedIds.Add(item.VariantId);
            }
        }

        if (failedIds.Count > 0)
        {
            return new InventoryReservationResult(
                false,
                $"Insufficient stock for {failedIds.Count} item(s).",
                failedIds
            );
        }

        foreach (var item in deductionItems)
        {
            var stock = stockItems.First(s => s.VariantId == item.VariantId);
            stock.AvailableQuantity -= item.Quantity;
            stock.MarkUpdated();

            var log = new StockLog(
                stock.Id,
                item.VariantId,
                -item.Quantity,
                stock.AvailableQuantity,
                $"Order deduction for order {orderId}",
                orderId
            );

            _dbContext.StockLogs.Add(log);
        }

        await _dbContext.SaveChangesAsync(ct);

        return new InventoryReservationResult(true, null, []);
    }

    public async Task ReleaseStockAsync(Guid orderId, IEnumerable<StockDeductionItem> items, CancellationToken ct = default)
    {
        var itemsList = items.ToList();
        var variantIds = itemsList.Select(i => i.VariantId).ToList();

        var stockItems = await _dbContext.StockItems
            .Where(s => variantIds.Contains(s.VariantId))
            .ToListAsync(ct);

        foreach (var item in itemsList)
        {
            var stock = stockItems.FirstOrDefault(s => s.VariantId == item.VariantId);
            if (stock != null)
            {
                stock.AvailableQuantity += item.Quantity;
                stock.MarkUpdated();

                var log = new StockLog(
                    stock.Id,
                    item.VariantId,
                    item.Quantity,
                    stock.AvailableQuantity,
                    $"Stock released due to cancellation of order {orderId}",
                    orderId
                );

                _dbContext.StockLogs.Add(log);
            }
        }

        await _dbContext.SaveChangesAsync(ct);
    }

    public async Task<StockLevelDto?> GetStockLevelAsync(Guid variantId, CancellationToken ct = default)
    {
        var stock = await _dbContext.StockItems
            .AsNoTracking()
            .FirstOrDefaultAsync(s => s.VariantId == variantId, ct);

        if (stock == null)
        {
            return null;
        }

        return new StockLevelDto(
            stock.VariantId,
            stock.AvailableQuantity,
            stock.ReservedQuantity,
            stock.AvailableQuantity > 0
        );
    }

    public async Task<bool> AdjustStockAsync(StockAdjustmentCommand command, CancellationToken ct = default)
    {
        var stock = await _dbContext.StockItems.FirstOrDefaultAsync(s => s.VariantId == command.VariantId, ct);
        if (stock == null)
        {
            stock = new StockItem(command.VariantId, 0);
            _dbContext.StockItems.Add(stock);
        }

        stock.AvailableQuantity += command.QuantityChange;
        if (stock.AvailableQuantity < 0)
        {
            stock.AvailableQuantity = 0;
        }
        stock.MarkUpdated();

        var log = new StockLog(
            stock.Id,
            command.VariantId,
            command.QuantityChange,
            stock.AvailableQuantity,
            command.Reason
        );

        _dbContext.StockLogs.Add(log);
        await _dbContext.SaveChangesAsync(ct);

        return true;
    }

    public async Task<IReadOnlyList<StockLevelDto>> ListStockLevelsAsync(CancellationToken ct = default)
    {
        var stockItems = await _dbContext.StockItems
            .AsNoTracking()
            .ToListAsync(ct);

        var variantIds = stockItems.Select(s => s.VariantId).ToList();

        var variantInfo = await _dbContext.ProductVariants
            .AsNoTracking()
            .Include(v => v.Product)
            .Where(v => variantIds.Contains(v.Id))
            .ToDictionaryAsync(v => v.Id, v => new { v.Sku, ProductName = v.Product.Name + " (" + v.Name + ")" }, ct);

        return stockItems.Select(s =>
        {
            variantInfo.TryGetValue(s.VariantId, out var info);
            return new StockLevelDto(
                s.VariantId,
                s.AvailableQuantity,
                s.ReservedQuantity,
                s.AvailableQuantity > 0,
                info?.Sku,
                info?.ProductName
            );
        }).ToList();
    }
}
