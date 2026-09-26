using Ecommerce.Modules.Catalog.Contracts;

namespace Ecommerce.Modules.Catalog;

public interface ICatalogModule
{
    Task<ProductDetailsDto?> GetProductByIdAsync(Guid productId, bool includeInactive = false, CancellationToken ct = default);
    Task<ProductDetailsDto?> GetProductBySlugAsync(string slug, CancellationToken ct = default);
    Task<VariantPricingDto?> GetVariantPriceSnapshotAsync(Guid variantId, CancellationToken ct = default);
    Task<PagedResult<ProductSummaryDto>> ListPublicProductsAsync(ProductQueryParameters query, CancellationToken ct = default);
    Task<IReadOnlyList<CategoryDto>> ListCategoriesAsync(CancellationToken ct = default);
    Task<Guid> CreateProductAsync(CreateProductCommand command, CancellationToken ct = default);
    Task<bool> UpdateProductAsync(Guid productId, UpdateProductCommand command, CancellationToken ct = default);
    Task<bool> DeleteProductAsync(Guid productId, CancellationToken ct = default);
    Task<Guid> AddVariantAsync(Guid productId, AddVariantCommand command, CancellationToken ct = default);
    Task<bool> UpdateVariantAsync(Guid productId, Guid variantId, UpdateVariantCommand command, CancellationToken ct = default);
    Task<bool> DeleteVariantAsync(Guid productId, Guid variantId, CancellationToken ct = default);
    Task<Guid> CreateCategoryAsync(CreateCategoryCommand command, CancellationToken ct = default);
}
