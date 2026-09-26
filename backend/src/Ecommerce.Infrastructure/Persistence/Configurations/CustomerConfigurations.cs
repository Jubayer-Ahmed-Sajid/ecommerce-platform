using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Ecommerce.Modules.Customers.Domain;

namespace Ecommerce.Infrastructure.Persistence.Configurations;

public class CustomerConfigurations :
    IEntityTypeConfiguration<Customer>,
    IEntityTypeConfiguration<CustomerAddress>
{
    public void Configure(EntityTypeBuilder<Customer> builder)
    {
        builder.ToTable("cus_customers");
        builder.HasKey(c => c.Id);

        builder.Property(c => c.FullName).HasMaxLength(200).IsRequired();
        builder.Property(c => c.PhoneNumber).HasMaxLength(30).IsRequired();
        builder.HasIndex(c => c.PhoneNumber);

        builder.Property(c => c.Email).HasMaxLength(256);

        builder.HasMany(c => c.Addresses)
            .WithOne(a => a.Customer)
            .HasForeignKey(a => a.CustomerId)
            .OnDelete(DeleteBehavior.Cascade);
    }

    public void Configure(EntityTypeBuilder<CustomerAddress> builder)
    {
        builder.ToTable("cus_customer_addresses");
        builder.HasKey(a => a.Id);

        builder.Property(a => a.AddressLine).HasMaxLength(500).IsRequired();
        builder.Property(a => a.City).HasMaxLength(100).IsRequired();
        builder.Property(a => a.Division).HasMaxLength(100).IsRequired();
        builder.Property(a => a.PostalCode).HasMaxLength(20);
    }
}
