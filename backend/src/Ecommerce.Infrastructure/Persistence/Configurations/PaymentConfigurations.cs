using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Ecommerce.Modules.Payments.Domain;

namespace Ecommerce.Infrastructure.Persistence.Configurations;

public class PaymentConfigurations :
    IEntityTypeConfiguration<Payment>,
    IEntityTypeConfiguration<PaymentTransaction>
{
    public void Configure(EntityTypeBuilder<Payment> builder)
    {
        builder.ToTable("pay_payments");
        builder.HasKey(p => p.Id);

        // OrderId is scalar GUID across module boundary
        builder.Property(p => p.OrderId).IsRequired();
        builder.HasIndex(p => p.OrderId).IsUnique();

        builder.Property(p => p.Amount).HasPrecision(18, 2).HasColumnType("decimal(18,2)").IsRequired();
        builder.Property(p => p.Method).HasConversion<int>().IsRequired();
        builder.Property(p => p.Status).HasConversion<int>().IsRequired();

        builder.Property(p => p.SenderPhoneNumber).HasMaxLength(30);
        builder.Property(p => p.TransactionId).HasMaxLength(100);
        builder.Property(p => p.AdminNotes).HasMaxLength(1000);

        builder.HasIndex(p => p.TransactionId);

        builder.HasMany(p => p.Transactions)
            .WithOne(t => t.Payment)
            .HasForeignKey(t => t.PaymentId)
            .OnDelete(DeleteBehavior.Cascade);
    }

    public void Configure(EntityTypeBuilder<PaymentTransaction> builder)
    {
        builder.ToTable("pay_transactions");
        builder.HasKey(t => t.Id);

        builder.Property(t => t.Amount).HasPrecision(18, 2).HasColumnType("decimal(18,2)").IsRequired();
        builder.Property(t => t.Method).HasConversion<int>().IsRequired();
        builder.Property(t => t.Status).HasConversion<int>().IsRequired();
        builder.Property(t => t.TransactionReference).HasMaxLength(100);
    }
}
