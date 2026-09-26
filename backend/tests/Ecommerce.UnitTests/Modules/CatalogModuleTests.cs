using Microsoft.EntityFrameworkCore;
using Ecommerce.Infrastructure.Persistence;
using Ecommerce.Infrastructure.Services;
using Ecommerce.Modules.Catalog.Contracts;

namespace Ecommerce.UnitTests.Modules;

public class CatalogModuleTests
{
    private static EcommerceDbContext CreateInMemoryDbContext()
    {
        var options = new DbContextOptionsBuilder<EcommerceDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        return new EcommerceDbContext(options);
    }

    [Fact]
    public async Task GetVariantPriceSnapshotAsync_CalculatesCorrectAdjustedPrice()
    {
        var db = CreateInMemoryDbContext();
        var catalog = new CatalogModule(db);

        var productId = await catalog.CreateProductAsync(new CreateProductCommand(
            "Cotton Polo",
            "cotton-polo",
            1200.00m,
            1500.00m,
            "100% Cotton",
            null,
            true,
            [
                new CreateVariantDto("POLO-S", "Small", 0, 10),
                new CreateVariantDto("POLO-XXL", "2X Large", 150.00m, 5)
            ],
            []
        ));

        var product = await catalog.GetProductByIdAsync(productId);
        Assert.NotNull(product);

        var standardVariant = product.Variants.First(v => v.Sku == "POLO-S");
        var premiumVariant = product.Variants.First(v => v.Sku == "POLO-XXL");

        var snapshotStandard = await catalog.GetVariantPriceSnapshotAsync(standardVariant.Id);
        var snapshotPremium = await catalog.GetVariantPriceSnapshotAsync(premiumVariant.Id);

        Assert.NotNull(snapshotStandard);
        Assert.NotNull(snapshotPremium);

        Assert.Equal(1200.00m, snapshotStandard.UnitPrice);
        Assert.Equal(1350.00m, snapshotPremium.UnitPrice); // 1200 + 150
    }

    [Fact]
    public async Task ListPublicProductsAsync_FiltersBySearchTerm_Accurately()
    {
        var db = CreateInMemoryDbContext();
        var catalog = new CatalogModule(db);

        await catalog.CreateProductAsync(new CreateProductCommand(
            "Blue Linen Shirt", "blue-linen-shirt", 1500m, null, "Comfortable summer shirt", null, false, [], []
        ));

        await catalog.CreateProductAsync(new CreateProductCommand(
            "Black Leather Belt", "black-leather-belt", 800m, null, "Formal accessory", null, false, [], []
        ));

        var searchResult = await catalog.ListPublicProductsAsync(new ProductQueryParameters(SearchTerm: "Linen"));

        Assert.Single(searchResult.Items);
        Assert.Equal("Blue Linen Shirt", searchResult.Items[0].Name);
    }

    [Fact]
    public async Task ListPublicProductsAsync_FiltersByPriceRange()
    {
        var db = CreateInMemoryDbContext();
        var catalog = new CatalogModule(db);

        await catalog.CreateProductAsync(new CreateProductCommand(
            "Budget Item", "budget-item", 500m, null, "Affordable", null, false, [], []
        ));

        await catalog.CreateProductAsync(new CreateProductCommand(
            "Mid Item", "mid-item", 1500m, null, "Mid-range", null, false, [], []
        ));

        await catalog.CreateProductAsync(new CreateProductCommand(
            "Luxury Item", "luxury-item", 5000m, null, "Premium", null, false, [], []
        ));

        var filtered = await catalog.ListPublicProductsAsync(new ProductQueryParameters(MinPrice: 1000m, MaxPrice: 2000m));

        Assert.Single(filtered.Items);
        Assert.Equal("Mid Item", filtered.Items[0].Name);
    }

    [Fact]
    public async Task VariantManagement_AddUpdateAndInvariantProtection()
    {
        var db = CreateInMemoryDbContext();
        var catalog = new CatalogModule(db);

        var productId = await catalog.CreateProductAsync(new CreateProductCommand(
            "Sneakers", "sneakers", 3000m, null, "Sport shoes", null, false,
            [new CreateVariantDto("SNK-42", "Size 42", 0, 10)], []
        ));

        // Add second variant
        var newVariantId = await catalog.AddVariantAsync(productId, new AddVariantCommand("SNK-43", "Size 43", 100m, 5));
        var product = await catalog.GetProductByIdAsync(productId);
        Assert.NotNull(product);
        Assert.Equal(2, product.Variants.Count);

        // Update variant
        var updateSuccess = await catalog.UpdateVariantAsync(productId, newVariantId, new UpdateVariantCommand("SNK-43-BLUE", "Size 43 Blue", 150m, true));
        Assert.True(updateSuccess);

        // Delete (deactivate) one variant succeeds when another exists
        var deleteSuccess = await catalog.DeleteVariantAsync(productId, newVariantId);
        Assert.True(deleteSuccess);

        // Attempting to delete the last active variant throws InvalidOperationException (Invariant enforcement)
        var remainingVariant = product.Variants.First(v => v.Sku == "SNK-42");
        await Assert.ThrowsAsync<InvalidOperationException>(() => catalog.DeleteVariantAsync(productId, remainingVariant.Id));
    }
}
