using Ecommerce.Domain.Common;

namespace Ecommerce.Modules.Identity.Domain;

public class Role : Entity<Guid>
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }

    public ICollection<UserRole> UserRoles { get; set; } = new List<UserRole>();

    public Role()
    {
        Id = Guid.NewGuid();
    }

    public Role(string name, string? description = null)
        : this()
    {
        Name = name;
        Description = description;
    }
}
