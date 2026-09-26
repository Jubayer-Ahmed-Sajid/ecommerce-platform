using Microsoft.EntityFrameworkCore;
using Ecommerce.Infrastructure.Persistence;
using Ecommerce.Modules.Customers;
using Ecommerce.Modules.Customers.Contracts;
using Ecommerce.Modules.Customers.Domain;

namespace Ecommerce.Infrastructure.Services;

public class CustomersModule : ICustomersModule
{
    private readonly EcommerceDbContext _dbContext;

    public CustomersModule(EcommerceDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<CustomerDto> GetOrCreateCustomerAsync(CustomerContactInfo contact, CancellationToken ct = default)
    {
        var normalizedPhone = contact.PhoneNumber.Trim();

        var customer = await _dbContext.Customers
            .FirstOrDefaultAsync(c => c.PhoneNumber == normalizedPhone, ct);

        if (customer == null)
        {
            customer = new Customer(
                contact.FullName.Trim(),
                normalizedPhone,
                contact.Email?.Trim()
            );

            _dbContext.Customers.Add(customer);
            await _dbContext.SaveChangesAsync(ct);
        }
        else
        {
            bool modified = false;
            if (!string.IsNullOrWhiteSpace(contact.FullName) && customer.FullName != contact.FullName)
            {
                customer.FullName = contact.FullName.Trim();
                modified = true;
            }

            if (!string.IsNullOrWhiteSpace(contact.Email) && customer.Email != contact.Email)
            {
                customer.Email = contact.Email.Trim();
                modified = true;
            }

            if (modified)
            {
                customer.MarkUpdated();
                await _dbContext.SaveChangesAsync(ct);
            }
        }

        return new CustomerDto(customer.Id, customer.FullName, customer.PhoneNumber, customer.Email);
    }

    public async Task<CustomerAddressDto> SaveAddressAsync(Guid customerId, AddressDetails address, CancellationToken ct = default)
    {
        var customerAddress = new CustomerAddress(
            customerId,
            address.AddressLine.Trim(),
            address.City.Trim(),
            address.Division.Trim(),
            address.PostalCode?.Trim(),
            address.IsDefault
        );

        _dbContext.CustomerAddresses.Add(customerAddress);
        await _dbContext.SaveChangesAsync(ct);

        return new CustomerAddressDto(
            customerAddress.Id,
            customerAddress.CustomerId,
            customerAddress.AddressLine,
            customerAddress.City,
            customerAddress.Division,
            customerAddress.PostalCode,
            customerAddress.IsDefault
        );
    }
}
