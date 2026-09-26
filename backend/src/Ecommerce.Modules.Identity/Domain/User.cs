using Ecommerce.Domain.Common;

namespace Ecommerce.Modules.Identity.Domain;

public class User : Entity<Guid>
{
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string? PhoneNumber { get; set; }
    public bool IsActive { get; set; } = true;
    public int FailedLoginAttempts { get; set; }
    public DateTimeOffset? LockoutEndUtc { get; set; }

    public ICollection<UserRole> UserRoles { get; set; } = new List<UserRole>();

    public User()
    {
        Id = Guid.NewGuid();
    }

    public User(string email, string passwordHash, string fullName, string? phoneNumber = null)
        : this()
    {
        Email = email.ToLowerInvariant().Trim();
        PasswordHash = passwordHash;
        FullName = fullName;
        PhoneNumber = phoneNumber?.Trim();
        IsActive = true;
    }
}
