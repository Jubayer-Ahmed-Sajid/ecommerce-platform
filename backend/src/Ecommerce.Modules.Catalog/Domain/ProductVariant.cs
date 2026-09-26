using Ecommerce.Domain.Common;

namespace Ecommerce.Modules.Catalog.Domain;

public class ProductVariant : Entity<Guid>
{
    public Guid ProductId { get; set; }
    public Product Product { get; set; } = null!;
    public string Sku { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public decimal PriceAdjustment { get; set; }
    public bool IsActive { get; set; } = true;

    public ProductVariant()
    {
        Id = Guid.NewGuid();
    }

    public ProductVariant(Guid productId, string sku, string name, decimal priceAdjustment = 0)
        : this()
    {
        ProductId = productId;
        Sku = sku;
        Name = name;
        PriceAdjustment = priceAdjustment;
        IsActive = true;
    }
}
