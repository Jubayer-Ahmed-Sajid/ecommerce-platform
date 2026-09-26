using Ecommerce.Domain.Common;

namespace Ecommerce.Modules.Catalog.Domain;

public class Product : Entity<Guid>
{
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string? Description { get; set; }
    public decimal BasePrice { get; set; }
    public decimal? OriginalPrice { get; set; }
    public Guid? CategoryId { get; set; }
    public Category? Category { get; set; }
    public bool IsActive { get; set; } = true;
    public bool IsFeatured { get; set; }

    public ICollection<ProductVariant> Variants { get; set; } = new List<ProductVariant>();
    public ICollection<ProductImage> Images { get; set; } = new List<ProductImage>();

    public Product()
    {
        Id = Guid.NewGuid();
    }

    public Product(string name, string slug, decimal basePrice, string? description = null, Guid? categoryId = null, decimal? originalPrice = null, bool isFeatured = false)
        : this()
    {
        Name = name;
        Slug = slug;
        BasePrice = basePrice;
        Description = description;
        CategoryId = categoryId;
        OriginalPrice = originalPrice;
        IsFeatured = isFeatured;
        IsActive = true;
    }
}
