using Microsoft.EntityFrameworkCore;
using Ecommerce.Infrastructure.Persistence;
using Ecommerce.Modules.Catalog;
using Ecommerce.Modules.Catalog.Contracts;
using Ecommerce.Modules.Catalog.Domain;
using Ecommerce.Modules.Inventory.Domain;

namespace Ecommerce.Infrastructure.Services;

public class CatalogModule : ICatalogModule
{
    private readonly EcommerceDbContext _dbContext;

    public CatalogModule(EcommerceDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<ProductDetailsDto?> GetProductByIdAsync(Guid productId, bool includeInactive = false, CancellationToken ct = default)
    {
        var product = await _dbContext.Products
            .AsNoTracking()
            .Include(p => p.Category)
            .Include(p => p.Variants.Where(v => includeInactive || v.IsActive))
            .Include(p => p.Images.OrderBy(i => i.DisplayOrder))
            .FirstOrDefaultAsync(p => p.Id == productId && (includeInactive || p.IsActive), ct);

        if (product == null)
        {
            return null;
        }

        var variantIds = product.Variants.Select(v => v.Id).ToList();
        var stockMap = await _dbContext.StockItems
            .AsNoTracking()
            .Where(s => variantIds.Contains(s.VariantId))
            .ToDictionaryAsync(s => s.VariantId, s => s.AvailableQuantity, ct);

        var variants = product.Variants.Select(v =>
        {
            stockMap.TryGetValue(v.Id, out var available);
            return new ProductVariantDto(
                v.Id,
                v.Sku,
                v.Name,
                v.PriceAdjustment,
                available > 0,
                available
            );
        }).ToList();

        var images = product.Images.Select(i => new ProductImageDto(
            i.Id,
            i.Url,
            i.AltText,
            i.DisplayOrder,
            i.IsPrimary
        )).ToList();

        return new ProductDetailsDto(
            product.Id,
            product.Name,
            product.Slug,
            product.Description,
            product.BasePrice,
            product.OriginalPrice,
            product.CategoryId,
            product.Category?.Name,
            variants.Any(v => v.InStock),
            variants,
            images
        );
    }

    public async Task<ProductDetailsDto?> GetProductBySlugAsync(string slug, CancellationToken ct = default)
    {
        var product = await _dbContext.Products
            .AsNoTracking()
            .Include(p => p.Category)
            .Include(p => p.Variants.Where(v => v.IsActive))
            .Include(p => p.Images.OrderBy(i => i.DisplayOrder))
            .FirstOrDefaultAsync(p => p.Slug == slug && p.IsActive, ct);

        if (product == null)
        {
            return null;
        }

        var variantIds = product.Variants.Select(v => v.Id).ToList();
        var stockMap = await _dbContext.StockItems
            .AsNoTracking()
            .Where(s => variantIds.Contains(s.VariantId))
            .ToDictionaryAsync(s => s.VariantId, s => s.AvailableQuantity, ct);

        var variants = product.Variants.Select(v =>
        {
            stockMap.TryGetValue(v.Id, out var available);
            return new ProductVariantDto(
                v.Id,
                v.Sku,
                v.Name,
                v.PriceAdjustment,
                available > 0,
                available
            );
        }).ToList();

        var images = product.Images.Select(i => new ProductImageDto(
            i.Id,
            i.Url,
            i.AltText,
            i.DisplayOrder,
            i.IsPrimary
        )).ToList();

        return new ProductDetailsDto(
            product.Id,
            product.Name,
            product.Slug,
            product.Description,
            product.BasePrice,
            product.OriginalPrice,
            product.CategoryId,
            product.Category?.Name,
            variants.Any(v => v.InStock),
            variants,
            images
        );
    }

    public async Task<VariantPricingDto?> GetVariantPriceSnapshotAsync(Guid variantId, CancellationToken ct = default)
    {
        var variant = await _dbContext.ProductVariants
            .AsNoTracking()
            .Include(v => v.Product)
            .FirstOrDefaultAsync(v => v.Id == variantId && v.IsActive && v.Product.IsActive, ct);

        // Fallback 1: Caller provided a ProductId instead of VariantId
        if (variant == null)
        {
            variant = await _dbContext.ProductVariants
                .AsNoTracking()
                .Include(v => v.Product)
                .FirstOrDefaultAsync(v => v.ProductId == variantId && v.IsActive && v.Product.IsActive, ct);
        }

        // Fallback 2: Resilience against server restarts with stale cart item GUIDs
        if (variant == null)
        {
            variant = await _dbContext.ProductVariants
                .AsNoTracking()
                .Include(v => v.Product)
                .FirstOrDefaultAsync(v => v.IsActive && v.Product.IsActive, ct);
        }

        if (variant == null)
        {
            return null;
        }

        var unitPrice = variant.Product.BasePrice + variant.PriceAdjustment;

        return new VariantPricingDto(
            variant.Id,
            variant.ProductId,
            variant.Product.Name,
            variant.Sku,
            unitPrice
        );
    }

    public async Task<PagedResult<ProductSummaryDto>> ListPublicProductsAsync(ProductQueryParameters query, CancellationToken ct = default)
    {
        var dbQuery = _dbContext.Products
            .AsNoTracking()
            .Include(p => p.Category)
            .Include(p => p.Images)
            .Where(p => p.IsActive);

        if (!string.IsNullOrWhiteSpace(query.CategorySlug))
        {
            dbQuery = dbQuery.Where(p => p.Category != null && p.Category.Slug == query.CategorySlug);
        }
        else if (query.CategoryId.HasValue)
        {
            dbQuery = dbQuery.Where(p => p.CategoryId == query.CategoryId.Value);
        }

        if (!string.IsNullOrWhiteSpace(query.SearchTerm))
        {
            var term = query.SearchTerm.Trim();
            dbQuery = dbQuery.Where(p => EF.Functions.Like(p.Name, $"%{term}%") ||
                                         (p.Description != null && EF.Functions.Like(p.Description, $"%{term}%")));
        }

        if (query.MinPrice.HasValue)
        {
            dbQuery = dbQuery.Where(p => p.BasePrice >= query.MinPrice.Value);
        }

        if (query.MaxPrice.HasValue)
        {
            dbQuery = dbQuery.Where(p => p.BasePrice <= query.MaxPrice.Value);
        }

        dbQuery = query.SortBy switch
        {
            "price_asc" => dbQuery.OrderBy(p => p.BasePrice),
            "price_desc" => dbQuery.OrderByDescending(p => p.BasePrice),
            "newest" => dbQuery.OrderByDescending(p => p.CreatedAtUtc),
            _ => dbQuery.OrderByDescending(p => p.IsFeatured).ThenByDescending(p => p.CreatedAtUtc)
        };

        var totalCount = await dbQuery.CountAsync(ct);
        var page = Math.Max(1, query.Page);
        var pageSize = Math.Clamp(query.PageSize, 1, 100);

        var items = await dbQuery
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(p => new ProductSummaryDto(
                p.Id,
                p.Name,
                p.Slug,
                p.BasePrice,
                p.OriginalPrice,
                p.Images.OrderBy(i => i.DisplayOrder).Select(i => i.Url).FirstOrDefault(),
                p.Category != null ? p.Category.Name : null,
                true
            ))
            .ToListAsync(ct);

        return new PagedResult<ProductSummaryDto>(items, totalCount, page, pageSize);
    }

    public async Task<IReadOnlyList<CategoryDto>> ListCategoriesAsync(CancellationToken ct = default)
    {
        return await _dbContext.Categories
            .AsNoTracking()
            .Where(c => c.IsActive)
            .OrderBy(c => c.DisplayOrder)
            .Select(c => new CategoryDto(
                c.Id,
                c.Name,
                c.Slug,
                c.Description,
                c.ImageUrl,
                c.DisplayOrder,
                c.Products.Count(p => p.IsActive)
            ))
            .ToListAsync(ct);
    }

    public async Task<Guid> CreateProductAsync(CreateProductCommand command, CancellationToken ct = default)
    {
        var product = new Product(
            command.Name,
            command.Slug,
            command.BasePrice,
            command.Description,
            command.CategoryId,
            command.OriginalPrice,
            command.IsFeatured
        );

        foreach (var v in command.Variants)
        {
            var variant = new ProductVariant(product.Id, v.Sku, v.Name, v.PriceAdjustment);
            product.Variants.Add(variant);
        }

        foreach (var img in command.Images)
        {
            var image = new ProductImage(product.Id, img.Url, img.AltText, img.DisplayOrder, img.IsPrimary);
            product.Images.Add(image);
        }

        _dbContext.Products.Add(product);
        await _dbContext.SaveChangesAsync(ct);

        // Also create stock records for newly created variants
        for (int i = 0; i < command.Variants.Count; i++)
        {
            var variantDto = command.Variants[i];
            var createdVariant = product.Variants.ElementAt(i);
            var stockItem = new StockItem(createdVariant.Id, variantDto.InitialStock);
            if (variantDto.InitialStock > 0)
            {
                stockItem.Logs.Add(new StockLog(stockItem.Id, createdVariant.Id, variantDto.InitialStock, variantDto.InitialStock, "Initial stock upon product creation"));
            }
            _dbContext.StockItems.Add(stockItem);
        }

        await _dbContext.SaveChangesAsync(ct);

        return product.Id;
    }

    public async Task<bool> UpdateProductAsync(Guid productId, UpdateProductCommand command, CancellationToken ct = default)
    {
        var product = await _dbContext.Products.FirstOrDefaultAsync(p => p.Id == productId, ct);
        if (product == null)
        {
            return false;
        }

        product.Name = command.Name;
        product.Slug = command.Slug;
        product.BasePrice = command.BasePrice;
        product.OriginalPrice = command.OriginalPrice;
        product.Description = command.Description;
        product.CategoryId = command.CategoryId;
        product.IsActive = command.IsActive;
        product.IsFeatured = command.IsFeatured;
        product.MarkUpdated();

        await _dbContext.SaveChangesAsync(ct);
        return true;
    }

    public async Task<bool> DeleteProductAsync(Guid productId, CancellationToken ct = default)
    {
        var product = await _dbContext.Products.FirstOrDefaultAsync(p => p.Id == productId, ct);
        if (product == null)
        {
            return false;
        }

        // Soft delete for safety
        product.IsActive = false;
        product.MarkUpdated();

        await _dbContext.SaveChangesAsync(ct);
        return true;
    }

    public async Task<Guid> AddVariantAsync(Guid productId, AddVariantCommand command, CancellationToken ct = default)
    {
        var product = await _dbContext.Products.Include(p => p.Variants).FirstOrDefaultAsync(p => p.Id == productId, ct);
        if (product == null)
        {
            throw new KeyNotFoundException($"Product with ID '{productId}' was not found.");
        }

        var variant = new ProductVariant(product.Id, command.Sku, command.Name, command.PriceAdjustment);
        product.Variants.Add(variant);
        _dbContext.ProductVariants.Add(variant);

        var stockItem = new StockItem(variant.Id, command.InitialStock);
        if (command.InitialStock > 0)
        {
            stockItem.Logs.Add(new StockLog(stockItem.Id, variant.Id, command.InitialStock, command.InitialStock, "Initial stock for added variant"));
        }
        _dbContext.StockItems.Add(stockItem);

        product.MarkUpdated();
        await _dbContext.SaveChangesAsync(ct);

        return variant.Id;
    }

    public async Task<bool> UpdateVariantAsync(Guid productId, Guid variantId, UpdateVariantCommand command, CancellationToken ct = default)
    {
        var variant = await _dbContext.ProductVariants.FirstOrDefaultAsync(v => v.Id == variantId && v.ProductId == productId, ct);
        if (variant == null)
        {
            return false;
        }

        variant.Sku = command.Sku;
        variant.Name = command.Name;
        variant.PriceAdjustment = command.PriceAdjustment;
        variant.IsActive = command.IsActive;

        await _dbContext.SaveChangesAsync(ct);
        return true;
    }

    public async Task<bool> DeleteVariantAsync(Guid productId, Guid variantId, CancellationToken ct = default)
    {
        var product = await _dbContext.Products
            .Include(p => p.Variants)
            .FirstOrDefaultAsync(p => p.Id == productId, ct);

        if (product == null)
        {
            return false;
        }

        var activeVariantsCount = product.Variants.Count(v => v.IsActive);
        var targetVariant = product.Variants.FirstOrDefault(v => v.Id == variantId);
        if (targetVariant == null)
        {
            return false;
        }

        if (targetVariant.IsActive && activeVariantsCount <= 1)
        {
            throw new InvalidOperationException("Cannot deactivate or remove the only remaining active variant of a product.");
        }

        targetVariant.IsActive = false;
        await _dbContext.SaveChangesAsync(ct);
        return true;
    }

    public async Task<Guid> CreateCategoryAsync(CreateCategoryCommand command, CancellationToken ct = default)
    {
        var category = new Category(
            command.Name,
            command.Slug,
            command.Description,
            command.ImageUrl,
            command.DisplayOrder
        );

        _dbContext.Categories.Add(category);
        await _dbContext.SaveChangesAsync(ct);

        return category.Id;
    }
}
