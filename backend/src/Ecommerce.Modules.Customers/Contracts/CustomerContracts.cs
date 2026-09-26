namespace Ecommerce.Modules.Customers.Contracts;

public record CustomerDto(
    Guid Id,
    string FullName,
    string PhoneNumber,
    string? Email
);

public record CustomerContactInfo(
    string FullName,
    string PhoneNumber,
    string? Email = null
);

public record CustomerAddressDto(
    Guid Id,
    Guid CustomerId,
    string AddressLine,
    string City,
    string Division,
    string? PostalCode,
    bool IsDefault
);

public record AddressDetails(
    string AddressLine,
    string City,
    string Division,
    string? PostalCode = null,
    bool IsDefault = false
);
