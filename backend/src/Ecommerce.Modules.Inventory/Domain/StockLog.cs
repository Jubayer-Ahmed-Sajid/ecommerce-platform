using Ecommerce.Domain.Common;

namespace Ecommerce.Modules.Inventory.Domain;

public class StockLog : Entity<Guid>
{
    public Guid StockItemId { get; set; }
    public StockItem StockItem { get; set; } = null!;
    public Guid VariantId { get; set; }
    public int QuantityChange { get; set; }
    public int NewAvailableQuantity { get; set; }
    public string Reason { get; set; } = string.Empty;
    public Guid? OrderId { get; set; }

    public StockLog()
    {
        Id = Guid.NewGuid();
    }

    public StockLog(Guid stockItemId, Guid variantId, int quantityChange, int newAvailableQuantity, string reason, Guid? orderId = null)
        : this()
    {
        StockItemId = stockItemId;
        VariantId = variantId;
        QuantityChange = quantityChange;
        NewAvailableQuantity = newAvailableQuantity;
        Reason = reason;
        OrderId = orderId;
    }
}
