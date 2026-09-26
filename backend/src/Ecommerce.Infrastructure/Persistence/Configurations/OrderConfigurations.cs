using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Ecommerce.Modules.Orders.Domain;

namespace Ecommerce.Infrastructure.Persistence.Configurations;

public class OrderConfigurations :
    IEntityTypeConfiguration<Order>,
    IEntityTypeConfiguration<OrderItem>,
    IEntityTypeConfiguration<OrderStatusHistory>
{
    public void Configure(EntityTypeBuilder<Order> builder)
    {
        builder.ToTable("ord_orders");
        builder.HasKey(o => o.Id);

        builder.Property(o => o.OrderNumber).HasMaxLength(50).IsRequired();
        builder.HasIndex(o => o.OrderNumber).IsUnique();

        // CustomerId is scalar GUID across module boundary (no cross-module FK)
        builder.Property(o => o.CustomerId).IsRequired();
        builder.HasIndex(o => o.CustomerId);

        builder.Property(o => o.CustomerFullName).HasMaxLength(200).IsRequired();
        builder.Property(o => o.CustomerPhone).HasMaxLength(30).IsRequired();
        builder.HasIndex(o => o.CustomerPhone);

        builder.Property(o => o.CustomerEmail).HasMaxLength(256);

        builder.Property(o => o.DeliveryAddress).HasMaxLength(500).IsRequired();
        builder.Property(o => o.DeliveryCity).HasMaxLength(100).IsRequired();
        builder.Property(o => o.DeliveryDivision).HasMaxLength(100).IsRequired();
        builder.Property(o => o.PostalCode).HasMaxLength(20);

        builder.Property(o => o.Status).HasConversion<int>().IsRequired();
        builder.Property(o => o.PaymentMethod).HasConversion<int>().IsRequired();

        builder.Property(o => o.SubTotal).HasPrecision(18, 2).HasColumnType("decimal(18,2)").IsRequired();
        builder.Property(o => o.ShippingFee).HasPrecision(18, 2).HasColumnType("decimal(18,2)").IsRequired();
        builder.Property(o => o.TotalAmount).HasPrecision(18, 2).HasColumnType("decimal(18,2)").IsRequired();

        builder.Property(o => o.CustomerNotes).HasMaxLength(1000);

        builder.HasIndex(o => new { o.Status, o.CreatedAtUtc });

        builder.HasMany(o => o.Items)
            .WithOne(i => i.Order)
            .HasForeignKey(i => i.OrderId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(o => o.StatusHistory)
            .WithOne(h => h.Order)
            .HasForeignKey(h => h.OrderId)
            .OnDelete(DeleteBehavior.Cascade);
    }

    public void Configure(EntityTypeBuilder<OrderItem> builder)
    {
        builder.ToTable("ord_order_items");
        builder.HasKey(i => i.Id);

        // ProductId & VariantId are scalar GUIDs across module boundaries
        builder.Property(i => i.VariantId).IsRequired();
        builder.Property(i => i.ProductId).IsRequired();

        builder.Property(i => i.ProductName).HasMaxLength(300).IsRequired();
        builder.Property(i => i.VariantName).HasMaxLength(200).IsRequired();
        builder.Property(i => i.Sku).HasMaxLength(100).IsRequired();

        builder.Property(i => i.UnitPrice).HasPrecision(18, 2).HasColumnType("decimal(18,2)").IsRequired();
        builder.Property(i => i.Quantity).IsRequired();
        builder.Property(i => i.LineTotal).HasPrecision(18, 2).HasColumnType("decimal(18,2)").IsRequired();
    }

    public void Configure(EntityTypeBuilder<OrderStatusHistory> builder)
    {
        builder.ToTable("ord_status_history");
        builder.HasKey(h => h.Id);

        builder.Property(h => h.OldStatus).HasConversion<int>().IsRequired();
        builder.Property(h => h.NewStatus).HasConversion<int>().IsRequired();
        builder.Property(h => h.Notes).HasMaxLength(1000);
    }
}
