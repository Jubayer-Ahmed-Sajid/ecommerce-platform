using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Ecommerce.Modules.Inventory.Domain;

namespace Ecommerce.Infrastructure.Persistence.Configurations;

public class InventoryConfigurations :
    IEntityTypeConfiguration<StockItem>,
    IEntityTypeConfiguration<StockLog>
{
    public void Configure(EntityTypeBuilder<StockItem> builder)
    {
        builder.ToTable("inv_stock_items");
        builder.HasKey(s => s.Id);

        // VariantId is stored as scalar GUID across module boundary (no cross-module FK)
        builder.Property(s => s.VariantId).IsRequired();
        builder.HasIndex(s => s.VariantId).IsUnique();

        builder.Property(s => s.AvailableQuantity).IsConcurrencyToken().IsRequired();
        builder.Property(s => s.ReservedQuantity).IsRequired();

        builder.HasMany(s => s.Logs)
            .WithOne(l => l.StockItem)
            .HasForeignKey(l => l.StockItemId)
            .OnDelete(DeleteBehavior.Cascade);
    }

    public void Configure(EntityTypeBuilder<StockLog> builder)
    {
        builder.ToTable("inv_stock_logs");
        builder.HasKey(l => l.Id);

        builder.Property(l => l.VariantId).IsRequired();
        builder.Property(l => l.Reason).HasMaxLength(500).IsRequired();

        builder.HasIndex(l => l.VariantId);
        builder.HasIndex(l => l.OrderId);
    }
}
