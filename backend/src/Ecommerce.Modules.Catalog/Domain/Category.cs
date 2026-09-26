using Ecommerce.Domain.Common;

namespace Ecommerce.Modules.Catalog.Domain;

public class Category : Entity<Guid>
{
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? ImageUrl { get; set; }
    public int DisplayOrder { get; set; }
    public bool IsActive { get; set; } = true;

    public ICollection<Product> Products { get; set; } = new List<Product>();

    public Category()
    {
        Id = Guid.NewGuid();
    }

    public Category(string name, string slug, string? description = null, string? imageUrl = null, int displayOrder = 0)
        : this()
    {
        Name = name;
        Slug = slug;
        Description = description;
        ImageUrl = imageUrl;
        DisplayOrder = displayOrder;
        IsActive = true;
    }
}
