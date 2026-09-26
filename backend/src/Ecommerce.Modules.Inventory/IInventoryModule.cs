using Ecommerce.Modules.Inventory.Contracts;

namespace Ecommerce.Modules.Inventory;

public interface IInventoryModule
{
    Task<bool> CheckAvailabilityAsync(Guid variantId, int requestedQuantity, CancellationToken ct = default);
    Task<InventoryReservationResult> DeductStockAsync(Guid orderId, IEnumerable<StockDeductionItem> items, CancellationToken ct = default);
    Task ReleaseStockAsync(Guid orderId, IEnumerable<StockDeductionItem> items, CancellationToken ct = default);
    Task<StockLevelDto?> GetStockLevelAsync(Guid variantId, CancellationToken ct = default);
    Task<bool> AdjustStockAsync(StockAdjustmentCommand command, CancellationToken ct = default);
    Task<IReadOnlyList<StockLevelDto>> ListStockLevelsAsync(CancellationToken ct = default);
}
