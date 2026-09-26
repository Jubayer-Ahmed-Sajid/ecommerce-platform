using Ecommerce.Domain.Common;

namespace Ecommerce.Modules.Customers.Domain;

public class CustomerAddress : Entity<Guid>
{
    public Guid CustomerId { get; set; }
    public Customer Customer { get; set; } = null!;
    public string AddressLine { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string Division { get; set; } = string.Empty;
    public string? PostalCode { get; set; }
    public bool IsDefault { get; set; }

    public CustomerAddress()
    {
        Id = Guid.NewGuid();
    }

    public CustomerAddress(Guid customerId, string addressLine, string city, string division, string? postalCode = null, bool isDefault = false)
        : this()
    {
        CustomerId = customerId;
        AddressLine = addressLine;
        City = city;
        Division = division;
        PostalCode = postalCode;
        IsDefault = isDefault;
    }
}
