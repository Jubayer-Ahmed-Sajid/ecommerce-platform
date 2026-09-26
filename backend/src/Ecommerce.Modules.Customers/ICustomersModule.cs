using Ecommerce.Modules.Customers.Contracts;

namespace Ecommerce.Modules.Customers;

public interface ICustomersModule
{
    Task<CustomerDto> GetOrCreateCustomerAsync(CustomerContactInfo contact, CancellationToken ct = default);
    Task<CustomerAddressDto> SaveAddressAsync(Guid customerId, AddressDetails address, CancellationToken ct = default);
}
