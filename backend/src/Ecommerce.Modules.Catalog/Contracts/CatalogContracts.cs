namespace Ecommerce.Modules.Catalog.Contracts;

public record ProductDetailsDto(
    Guid Id,
    string Name,
    string Slug,
    string? Description,
    decimal BasePrice,
    decimal? OriginalPrice,
    Guid? CategoryId,
    string? CategoryName,
    bool InStock,
    IReadOnlyList<ProductVariantDto> Variants,
    IReadOnlyList<ProductImageDto> Images
);

public record ProductVariantDto(
    Guid Id,
    string Sku,
    string Name,
    decimal PriceAdjustment,
    bool InStock,
    int AvailableQuantity = 0
);

public record ProductImageDto(
    Guid Id,
    string Url,
    string? AltText,
    int DisplayOrder,
    bool IsPrimary
);

public record VariantPricingDto(
    Guid VariantId,
    Guid ProductId,
    string ProductName,
    string Sku,
    decimal UnitPrice
);

public record ProductSummaryDto(
    Guid Id,
    string Name,
    string Slug,
    decimal BasePrice,
    decimal? OriginalPrice,
    string? PrimaryImageUrl,
    string? CategoryName,
    bool InStock = true
);

public record CategoryDto(
    Guid Id,
    string Name,
    string Slug,
    string? Description,
    string? ImageUrl,
    int DisplayOrder,
    int ProductCount = 0
);

public record CreateVariantDto(
    string Sku,
    string Name,
    decimal PriceAdjustment,
    int InitialStock = 0
);

public record CreateImageDto(
    string Url,
    string? AltText,
    int DisplayOrder,
    bool IsPrimary
);

public record CreateProductCommand(
    string Name,
    string Slug,
    decimal BasePrice,
    decimal? OriginalPrice,
    string? Description,
    Guid? CategoryId,
    bool IsFeatured,
    IReadOnlyList<CreateVariantDto> Variants,
    IReadOnlyList<CreateImageDto> Images
);

public record UpdateProductCommand(
    string Name,
    string Slug,
    decimal BasePrice,
    decimal? OriginalPrice,
    string? Description,
    Guid? CategoryId,
    bool IsActive,
    bool IsFeatured
);

public record CreateCategoryCommand(
    string Name,
    string Slug,
    string? Description,
    string? ImageUrl,
    int DisplayOrder
);

public record AddVariantCommand(
    string Sku,
    string Name,
    decimal PriceAdjustment,
    int InitialStock = 0
);

public record UpdateVariantCommand(
    string Sku,
    string Name,
    decimal PriceAdjustment,
    bool IsActive
);

public record ProductQueryParameters(
    string? SearchTerm = null,
    string? CategorySlug = null,
    Guid? CategoryId = null,
    decimal? MinPrice = null,
    decimal? MaxPrice = null,
    int Page = 1,
    int PageSize = 20,
    string? SortBy = null,
    bool IsAscending = true
);

public record PagedResult<T>(
    IReadOnlyList<T> Items,
    int TotalCount,
    int Page,
    int PageSize
)
{
    public int TotalPages => (int)Math.Ceiling(TotalCount / (double)PageSize);
    public bool HasNextPage => Page < TotalPages;
    public bool HasPreviousPage => Page > 1;
}
