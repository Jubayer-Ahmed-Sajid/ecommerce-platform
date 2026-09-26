using Ecommerce.Domain.Common;

namespace Ecommerce.Modules.Catalog.Domain;

public class ProductImage : Entity<Guid>
{
    public Guid ProductId { get; set; }
    public Product Product { get; set; } = null!;
    public string Url { get; set; } = string.Empty;
    public string? AltText { get; set; }
    public int DisplayOrder { get; set; }
    public bool IsPrimary { get; set; }

    public ProductImage()
    {
        Id = Guid.NewGuid();
    }

    public ProductImage(Guid productId, string url, string? altText = null, int displayOrder = 0, bool isPrimary = false)
        : this()
    {
        ProductId = productId;
        Url = url;
        AltText = altText;
        DisplayOrder = displayOrder;
        IsPrimary = isPrimary;
    }
}
