namespace Ecommerce.Modules.Inventory.Contracts;

public record InventoryReservationResult(
    bool Success,
    string? ErrorMessage,
    IReadOnlyList<Guid> FailedVariantIds
);

public record StockDeductionItem(
    Guid VariantId,
    int Quantity
);

public record StockLevelDto(
    Guid VariantId,
    int AvailableQuantity,
    int ReservedQuantity,
    bool IsInStock,
    string? Sku = null,
    string? ProductName = null
);

public record StockAdjustmentCommand(
    Guid VariantId,
    int QuantityChange,
    string Reason
);
