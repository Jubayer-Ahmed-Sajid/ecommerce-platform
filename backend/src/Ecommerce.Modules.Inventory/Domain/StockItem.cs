using Ecommerce.Domain.Common;

namespace Ecommerce.Modules.Inventory.Domain;

public class StockItem : Entity<Guid>
{
    public Guid VariantId { get; set; }
    public int AvailableQuantity { get; set; }
    public int ReservedQuantity { get; set; }

    public ICollection<StockLog> Logs { get; set; } = new List<StockLog>();

    public StockItem()
    {
        Id = Guid.NewGuid();
    }

    public StockItem(Guid variantId, int initialQuantity)
        : this()
    {
        VariantId = variantId;
        AvailableQuantity = Math.Max(0, initialQuantity);
        ReservedQuantity = 0;
    }
}
