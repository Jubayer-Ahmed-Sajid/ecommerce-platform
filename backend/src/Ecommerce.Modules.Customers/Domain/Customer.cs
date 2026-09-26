using Ecommerce.Domain.Common;

namespace Ecommerce.Modules.Customers.Domain;

public class Customer : Entity<Guid>
{
    public string FullName { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public string? Email { get; set; }

    public ICollection<CustomerAddress> Addresses { get; set; } = new List<CustomerAddress>();

    public Customer()
    {
        Id = Guid.NewGuid();
    }

    public Customer(string fullName, string phoneNumber, string? email = null)
        : this()
    {
        FullName = fullName;
        PhoneNumber = phoneNumber;
        Email = email;
    }
}
