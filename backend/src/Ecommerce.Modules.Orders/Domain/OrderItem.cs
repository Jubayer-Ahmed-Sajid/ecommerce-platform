using Ecommerce.Domain.Common;

namespace Ecommerce.Modules.Orders.Domain;

public class OrderItem : Entity<Guid>
{
    public Guid OrderId { get; set; }
    public Order Order { get; set; } = null!;

    public Guid VariantId { get; set; }
    public Guid ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public string VariantName { get; set; } = string.Empty;
    public string Sku { get; set; } = string.Empty;

    public decimal UnitPrice { get; set; }
    public int Quantity { get; set; }
    public decimal LineTotal { get; set; }

    public OrderItem()
    {
        Id = Guid.NewGuid();
    }

    public OrderItem(
        Guid orderId,
        Guid variantId,
        Guid productId,
        string productName,
        string variantName,
        string sku,
        decimal unitPrice,
        int quantity)
        : this()
    {
        OrderId = orderId;
        VariantId = variantId;
        ProductId = productId;
        ProductName = productName;
        VariantName = variantName;
        Sku = sku;
        UnitPrice = unitPrice;
        Quantity = quantity;
        LineTotal = unitPrice * quantity;
    }
}
