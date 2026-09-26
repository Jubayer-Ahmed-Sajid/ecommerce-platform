using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Ecommerce.Modules.Catalog.Domain;

namespace Ecommerce.Infrastructure.Persistence.Configurations;

public class CatalogConfigurations :
    IEntityTypeConfiguration<Category>,
    IEntityTypeConfiguration<Product>,
    IEntityTypeConfiguration<ProductVariant>,
    IEntityTypeConfiguration<ProductImage>
{
    public void Configure(EntityTypeBuilder<Category> builder)
    {
        builder.ToTable("cat_categories");
        builder.HasKey(c => c.Id);

        builder.Property(c => c.Name).HasMaxLength(200).IsRequired();
        builder.Property(c => c.Slug).HasMaxLength(200).IsRequired();
        builder.HasIndex(c => c.Slug).IsUnique();

        builder.Property(c => c.Description).HasMaxLength(1000);
        builder.Property(c => c.ImageUrl).HasMaxLength(1000);
    }

    public void Configure(EntityTypeBuilder<Product> builder)
    {
        builder.ToTable("cat_products");
        builder.HasKey(p => p.Id);

        builder.Property(p => p.Name).HasMaxLength(300).IsRequired();
        builder.Property(p => p.Slug).HasMaxLength(300).IsRequired();
        builder.HasIndex(p => p.Slug).IsUnique();

        builder.Property(p => p.BasePrice).HasPrecision(18, 2).HasColumnType("decimal(18,2)").IsRequired();
        builder.Property(p => p.OriginalPrice).HasPrecision(18, 2).HasColumnType("decimal(18,2)");

        builder.HasOne(p => p.Category)
            .WithMany(c => c.Products)
            .HasForeignKey(p => p.CategoryId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasMany(p => p.Variants)
            .WithOne(v => v.Product)
            .HasForeignKey(v => v.ProductId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(p => p.Images)
            .WithOne(i => i.Product)
            .HasForeignKey(i => i.ProductId)
            .OnDelete(DeleteBehavior.Cascade);
    }

    public void Configure(EntityTypeBuilder<ProductVariant> builder)
    {
        builder.ToTable("cat_product_variants");
        builder.HasKey(v => v.Id);

        builder.Property(v => v.Sku).HasMaxLength(100).IsRequired();
        builder.HasIndex(v => v.Sku).IsUnique();

        builder.Property(v => v.Name).HasMaxLength(200).IsRequired();
        builder.Property(v => v.PriceAdjustment).HasPrecision(18, 2).HasColumnType("decimal(18,2)").IsRequired();
    }

    public void Configure(EntityTypeBuilder<ProductImage> builder)
    {
        builder.ToTable("cat_product_images");
        builder.HasKey(i => i.Id);

        builder.Property(i => i.Url).HasMaxLength(1000).IsRequired();
        builder.Property(i => i.AltText).HasMaxLength(300);
    }
}
