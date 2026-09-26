using System.Text.Json.Serialization;
using System.Text.RegularExpressions;
using System.Threading.RateLimiting;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.FileProviders;
using Ecommerce.Api.Contracts;
using Ecommerce.Domain.Enums;
using Ecommerce.Infrastructure;
using Ecommerce.Infrastructure.Persistence;
using Ecommerce.Infrastructure.Storage;
using Ecommerce.Modules.Catalog;
using Ecommerce.Modules.Catalog.Contracts;
using Ecommerce.Modules.Identity;
using Ecommerce.Modules.Identity.Contracts;
using Ecommerce.Modules.Identity.Services;
using Ecommerce.Modules.Inventory;
using Ecommerce.Modules.Inventory.Contracts;
using Ecommerce.Modules.Orders;
using Ecommerce.Modules.Orders.Contracts;
using Ecommerce.Modules.Payments;

var builder = WebApplication.CreateBuilder(args);

// 1. Services Configuration
builder.Services.AddProblemDetails();
builder.Services.AddOpenApi();
builder.Services.ConfigureHttpJsonOptions(options =>
{
    options.SerializerOptions.Converters.Add(new JsonStringEnumConverter());
});
builder.Services.AddInfrastructure(builder.Configuration);

builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;

    // Brute-force protection for login: 5 req/min per IP
    options.AddPolicy("AuthRateLimit", httpContext =>
        RateLimitPartition.GetFixedWindowLimiter(
            httpContext.Connection.RemoteIpAddress?.ToString() ?? "anonymous",
            _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 5,
                Window = TimeSpan.FromMinutes(1),
                QueueLimit = 0
            }));

    // Scanning protection for public tracking & cancellation: 10 req/min per IP
    options.AddPolicy("TrackRateLimit", httpContext =>
        RateLimitPartition.GetFixedWindowLimiter(
            httpContext.Connection.RemoteIpAddress?.ToString() ?? "anonymous",
            _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 10,
                Window = TimeSpan.FromMinutes(1),
                QueueLimit = 0
            }));

    // Spam protection for checkout: 10 req/min per IP
    options.AddPolicy("CheckoutRateLimit", httpContext =>
        RateLimitPartition.GetFixedWindowLimiter(
            httpContext.Connection.RemoteIpAddress?.ToString() ?? "anonymous",
            _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 10,
                Window = TimeSpan.FromMinutes(1),
                QueueLimit = 0
            }));
});

builder.Services.AddCors(options =>
{
    options.AddPolicy("FrontendCorsPolicy", policy =>
    {
        var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>()
            ?? ["http://localhost:3000"];

        policy.WithOrigins(allowedOrigins)
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

var app = builder.Build();

// 2. Database Initialization & Seeding on Startup
try
{
    using var scope = app.Services.CreateScope();
    var dbContext = scope.ServiceProvider.GetRequiredService<EcommerceDbContext>();
    var passwordHasher = scope.ServiceProvider.GetRequiredService<IPasswordHasher>();

    if (dbContext.Database.IsRelational())
    {
        await dbContext.Database.MigrateAsync();
    }
    else
    {
        await dbContext.Database.EnsureCreatedAsync();
    }

    await EcommerceDbSeeder.SeedAsync(dbContext, passwordHasher);
}
catch (Exception ex)
{
    Console.Error.WriteLine($"[Startup Warning] Database initialization: {ex.Message}");
}

// 3. Middleware Pipeline
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseStatusCodePages();
app.UseExceptionHandler();
if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}
app.UseCors("FrontendCorsPolicy");
app.UseRateLimiter();

// Static files for media storage
var uploadDirectory = Path.Combine(builder.Environment.ContentRootPath, builder.Configuration["Storage:UploadDirectory"] ?? "uploads");
Directory.CreateDirectory(uploadDirectory);
var baseUrl = builder.Configuration["Storage:BaseUrl"] ?? "/uploads";

app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(uploadDirectory),
    RequestPath = baseUrl
});

// Root status endpoint
app.MapGet("/", () => Results.Ok(new
{
    service = "ShopBD E-Commerce API",
    status = "Healthy",
    version = "1.0.0",
    health = "/health",
    catalog = "/api/v1/products",
    categories = "/api/v1/categories"
})).WithName("RootStatus");

// Health check
app.MapGet("/health", () => Results.Ok(new HealthStatus("Healthy", DateTimeOffset.UtcNow)))
    .WithName("HealthCheck");

// ==========================================
// STOREFRONT PUBLIC API ROUTES (/api/v1/...)
// ==========================================
var api = app.MapGroup("/api/v1");

// --- Bulk 10K Seeding & Benchmark Route ---
api.MapPost("/debug/seed-10k", async (EcommerceDbContext dbContext, CancellationToken ct) =>
{
    var sw = System.Diagnostics.Stopwatch.StartNew();
    var count = await EcommerceDbSeeder.SeedBulkCatalogProductsAsync(dbContext, 10000, ct);
    sw.Stop();
    return Results.Ok(new
    {
        message = "Successfully seeded diverse catalog",
        totalProducts = count,
        elapsedMilliseconds = sw.ElapsedMilliseconds,
        elapsedSeconds = Math.Round(sw.Elapsed.TotalSeconds, 2)
    });
}).WithName("SeedTenThousandProducts");

// --- Catalog & Categories ---
api.MapGet("/products", async (
    string? searchTerm,
    string? categorySlug,
    Guid? categoryId,
    decimal? minPrice,
    decimal? maxPrice,
    int? page,
    int? pageSize,
    string? sortBy,
    ICatalogModule catalog) =>
{
    var query = new ProductQueryParameters(
        searchTerm,
        categorySlug,
        categoryId,
        minPrice,
        maxPrice,
        page ?? 1,
        pageSize ?? 20,
        sortBy
    );
    var result = await catalog.ListPublicProductsAsync(query);
    return Results.Ok(result);
}).WithName("ListPublicProducts");

api.MapGet("/products/{slug}", async (string slug, ICatalogModule catalog) =>
{
    var product = await catalog.GetProductBySlugAsync(slug);
    return product != null
        ? Results.Ok(product)
        : Results.Problem("Product not found.", statusCode: 404);
}).WithName("GetProductBySlug");

api.MapGet("/categories", async (ICatalogModule catalog) =>
{
    var categories = await catalog.ListCategoriesAsync();
    return Results.Ok(categories);
}).WithName("ListCategories");

// --- Orders & Checkout ---
var bangladeshPhoneRegex = new Regex(@"^(?:\+?8801|01)[3-9]\d{8}$", RegexOptions.Compiled);

api.MapPost("/orders/checkout", async (CreateOrderCommand command, IOrdersModule orders) =>
{
    // Server-side validation
    if (string.IsNullOrWhiteSpace(command.CustomerFullName))
    {
        return Results.Problem("Customer full name is required.", statusCode: 400);
    }

    if (string.IsNullOrWhiteSpace(command.CustomerPhone) || !bangladeshPhoneRegex.IsMatch(command.CustomerPhone.Trim()))
    {
        return Results.Problem("Please provide a valid 11-digit Bangladeshi mobile number.", statusCode: 400);
    }

    if (string.IsNullOrWhiteSpace(command.DeliveryAddress))
    {
        return Results.Problem("Delivery address is required.", statusCode: 400);
    }

    if (string.IsNullOrWhiteSpace(command.DeliveryCity))
    {
        return Results.Problem("Delivery city is required.", statusCode: 400);
    }

    if (command.Items == null || command.Items.Count == 0)
    {
        return Results.Problem("Order must contain at least one item.", statusCode: 400);
    }

    var result = await orders.CheckoutAsync(command);
    if (!result.Success)
    {
        return Results.Problem(result.ErrorMessage ?? "Order checkout failed.", statusCode: 400);
    }

    return Results.Ok(result);
}).RequireRateLimiting("CheckoutRateLimit").WithName("CheckoutOrder");

api.MapGet("/orders/{orderNumber}/track", async (string orderNumber, string? phoneNumber, IOrdersModule orders) =>
{
    if (string.IsNullOrWhiteSpace(phoneNumber))
    {
        return Results.Problem("Phone number is required for tracking verification.", statusCode: 400);
    }

    var order = await orders.GetOrderByOrderNumberAsync(orderNumber, phoneNumber);
    return order != null
        ? Results.Ok(order)
        : Results.Problem("Order not found or phone number does not match.", statusCode: 404);
}).RequireRateLimiting("TrackRateLimit").WithName("TrackOrder");

api.MapPost("/orders/{orderNumber}/cancel", async (string orderNumber, CancelOrderRequest request, IOrdersModule orders) =>
{
    if (string.IsNullOrWhiteSpace(request.PhoneNumber))
    {
        return Results.Problem("Phone number is required to verify order cancellation.", statusCode: 400);
    }

    var result = await orders.CancelOrderAsCustomerAsync(orderNumber, request.PhoneNumber, request.Reason);
    return result.Success
        ? Results.Ok(result)
        : Results.Problem(result.Message ?? "Failed to cancel order.", statusCode: 400);
}).RequireRateLimiting("TrackRateLimit").WithName("CustomerCancelOrder");

api.MapGet("/orders/{orderId:guid}", async (Guid orderId, IOrdersModule orders) =>
{
    var order = await orders.GetOrderByIdAsync(orderId);
    return order != null
        ? Results.Ok(order)
        : Results.Problem("Order not found.", statusCode: 404);
}).WithName("GetOrderById");

// --- User / Customer Authentication ---
var userAuth = api.MapGroup("/auth");

userAuth.MapPost("/login", async (LoginRequest request, IIdentityModule identity, HttpContext httpContext) =>
{
    if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
    {
        return Results.Problem("Email and password are required.", statusCode: 400);
    }

    var authResult = await identity.AuthenticateUserAsync(request.Email, request.Password);
    if (!authResult.IsSuccess || authResult.Token == null)
    {
        return Results.Problem(authResult.ErrorMessage ?? "Invalid credentials.", statusCode: 401);
    }

    var claims = await identity.ValidateTokenAsync(authResult.Token);
    var profile = claims != null ? await identity.GetUserProfileAsync(claims.UserId) : null;

    httpContext.Response.Cookies.Append("user_session", authResult.Token, new CookieOptions
    {
        HttpOnly = true,
        Secure = !app.Environment.IsDevelopment(),
        SameSite = SameSiteMode.Lax,
        Expires = authResult.ExpiresAt
    });

    return Results.Ok(new
    {
        token = authResult.Token,
        expiresAt = authResult.ExpiresAt,
        user = profile ?? new UserProfileDto(Guid.Empty, "Customer", request.Email, null, "Customer")
    });
}).RequireRateLimiting("AuthRateLimit").WithName("UserLogin");

userAuth.MapPost("/register", async (RegisterUserRequest request, IIdentityModule identity, HttpContext httpContext) =>
{
    if (string.IsNullOrWhiteSpace(request.FullName) || string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
    {
        return Results.Problem("Full name, email, and password are required.", statusCode: 400);
    }

    var authResult = await identity.RegisterUserAsync(new RegisterUserDto(request.FullName, request.Email, request.Password, request.PhoneNumber));
    if (!authResult.IsSuccess || authResult.Token == null)
    {
        return Results.Problem(authResult.ErrorMessage ?? "Failed to create account.", statusCode: 400);
    }

    var claims = await identity.ValidateTokenAsync(authResult.Token);
    var profile = claims != null ? await identity.GetUserProfileAsync(claims.UserId) : null;

    httpContext.Response.Cookies.Append("user_session", authResult.Token, new CookieOptions
    {
        HttpOnly = true,
        Secure = !app.Environment.IsDevelopment(),
        SameSite = SameSiteMode.Lax,
        Expires = authResult.ExpiresAt
    });

    return Results.Ok(new
    {
        token = authResult.Token,
        expiresAt = authResult.ExpiresAt,
        user = profile ?? new UserProfileDto(Guid.Empty, request.FullName, request.Email, request.PhoneNumber, "Customer")
    });
}).RequireRateLimiting("AuthRateLimit").WithName("UserRegister");

userAuth.MapPost("/logout", (HttpContext httpContext) =>
{
    httpContext.Response.Cookies.Delete("user_session");
    return Results.Ok(new { message = "Logged out successfully." });
}).WithName("UserLogout");

userAuth.MapGet("/me", async (HttpContext httpContext, IIdentityModule identity) =>
{
    var token = ExtractUserToken(httpContext);
    if (string.IsNullOrWhiteSpace(token))
    {
        return Results.Problem("Unauthenticated.", statusCode: 401);
    }

    var claims = await identity.ValidateTokenAsync(token);
    if (claims == null)
    {
        return Results.Problem("Invalid or expired session.", statusCode: 401);
    }

    var profile = await identity.GetUserProfileAsync(claims.UserId);
    if (profile == null)
    {
        return Results.Problem("User not found.", statusCode: 404);
    }

    return Results.Ok(profile);
}).WithName("UserGetSession");

// --- Admin Authentication ---
api.MapPost("/admin/auth/login", async (LoginRequest request, IIdentityModule identity, HttpContext httpContext) =>
{
    if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
    {
        return Results.Problem("Email and password are required.", statusCode: 400);
    }

    var authResult = await identity.AuthenticateAdminAsync(request.Email, request.Password);
    if (!authResult.IsSuccess || authResult.Token == null)
    {
        return Results.Problem(authResult.ErrorMessage ?? "Invalid credentials.", statusCode: 401);
    }

    // Set secure HttpOnly session cookie
    httpContext.Response.Cookies.Append("admin_session", authResult.Token, new CookieOptions
    {
        HttpOnly = true,
        Secure = !app.Environment.IsDevelopment(),
        SameSite = SameSiteMode.Lax,
        Expires = authResult.ExpiresAt
    });

    return Results.Ok(new
    {
        token = authResult.Token,
        expiresAt = authResult.ExpiresAt,
        user = new
        {
            email = request.Email,
            role = "Admin"
        }
    });
}).RequireRateLimiting("AuthRateLimit").WithName("AdminLogin");

api.MapPost("/admin/auth/logout", (HttpContext httpContext) =>
{
    httpContext.Response.Cookies.Delete("admin_session");
    return Results.Ok(new { message = "Logged out successfully." });
}).WithName("AdminLogout");

api.MapGet("/admin/auth/me", async (HttpContext httpContext, IIdentityModule identity) =>
{
    var token = ExtractToken(httpContext);
    if (string.IsNullOrWhiteSpace(token))
    {
        return Results.Problem("Unauthenticated.", statusCode: 401);
    }

    var claims = await identity.ValidateTokenAsync(token);
    if (claims == null)
    {
        return Results.Problem("Invalid or expired session.", statusCode: 401);
    }

    return Results.Ok(claims);
}).WithName("AdminGetSession");

// ==========================================
// ADMIN PROTECTED ROUTES (/api/v1/admin/...)
// ==========================================
var adminApi = api.MapGroup("/admin")
    .AddEndpointFilter(async (context, next) =>
    {
        var httpContext = context.HttpContext;
        var identity = httpContext.RequestServices.GetRequiredService<IIdentityModule>();

        // Allow public access to login/logout/health
        var path = httpContext.Request.Path.Value ?? string.Empty;
        if (path.EndsWith("/auth/login", StringComparison.OrdinalIgnoreCase) ||
            path.EndsWith("/auth/logout", StringComparison.OrdinalIgnoreCase))
        {
            return await next(context);
        }

        var token = ExtractToken(httpContext);
        if (string.IsNullOrWhiteSpace(token))
        {
            return Results.Problem("Administrator authorization required.", statusCode: 401);
        }

        var claims = await identity.ValidateTokenAsync(token);
        if (claims == null || !claims.Role.Equals("Admin", StringComparison.OrdinalIgnoreCase))
        {
            return Results.Problem("Insufficient administrative privileges.", statusCode: 403);
        }

        return await next(context);
    });

// --- Admin Dashboard Metrics ---
adminApi.MapGet("/dashboard/metrics", async (EcommerceDbContext db) =>
{
    var totalOrders = await db.Orders.CountAsync();
    var pendingOrders = await db.Orders.CountAsync(o => o.Status == OrderStatus.PendingPayment || o.Status == OrderStatus.Processing);
    var pendingPayments = await db.Payments.CountAsync(p => p.Status == PaymentStatus.Pending && p.Method != PaymentMethod.CashOnDelivery);
    var lowStockCount = await db.StockItems.CountAsync(s => s.AvailableQuantity <= 5);
    var totalRevenue = await db.Orders
        .Where(o => o.Status != OrderStatus.Cancelled)
        .SumAsync(o => o.TotalAmount);

    return Results.Ok(new
    {
        totalRevenue,
        totalOrders,
        pendingOrders,
        pendingPayments,
        lowStockCount
    });
}).WithName("GetDashboardMetrics");

// --- Admin Products Management ---
adminApi.MapPost("/products", async (CreateProductCommand command, ICatalogModule catalog) =>
{
    if (string.IsNullOrWhiteSpace(command.Name) || string.IsNullOrWhiteSpace(command.Slug))
    {
        return Results.Problem("Product name and slug are required.", statusCode: 400);
    }

    if (command.BasePrice < 0)
    {
        return Results.Problem("Base price cannot be negative.", statusCode: 400);
    }

    var id = await catalog.CreateProductAsync(command);
    return Results.Created($"/api/v1/products/{command.Slug}", new { id });
}).WithName("AdminCreateProduct");

adminApi.MapPut("/products/{productId:guid}", async (Guid productId, UpdateProductCommand command, ICatalogModule catalog) =>
{
    var updated = await catalog.UpdateProductAsync(productId, command);
    return updated
        ? Results.Ok(new { success = true })
        : Results.Problem("Product not found.", statusCode: 404);
}).WithName("AdminUpdateProduct");

adminApi.MapGet("/products/{productId:guid}", async (Guid productId, ICatalogModule catalog) =>
{
    var product = await catalog.GetProductByIdAsync(productId, includeInactive: true);
    return product != null
        ? Results.Ok(product)
        : Results.Problem("Product not found.", statusCode: 404);
}).WithName("AdminGetProductById");

adminApi.MapDelete("/products/{productId:guid}", async (Guid productId, ICatalogModule catalog) =>
{
    var deleted = await catalog.DeleteProductAsync(productId);
    return deleted
        ? Results.Ok(new { success = true })
        : Results.Problem("Product not found.", statusCode: 404);
}).WithName("AdminDeleteProduct");

// Admin Variant Management
adminApi.MapPost("/products/{productId:guid}/variants", async (Guid productId, AddVariantCommand command, ICatalogModule catalog) =>
{
    if (string.IsNullOrWhiteSpace(command.Sku) || string.IsNullOrWhiteSpace(command.Name))
    {
        return Results.Problem("Variant SKU and Name are required.", statusCode: 400);
    }

    try
    {
        var variantId = await catalog.AddVariantAsync(productId, command);
        return Results.Created($"/api/v1/admin/products/{productId}/variants/{variantId}", new { variantId });
    }
    catch (KeyNotFoundException)
    {
        return Results.Problem("Product not found.", statusCode: 404);
    }
}).WithName("AdminAddVariant");

adminApi.MapPut("/products/{productId:guid}/variants/{variantId:guid}", async (
    Guid productId,
    Guid variantId,
    UpdateVariantCommand command,
    ICatalogModule catalog) =>
{
    if (string.IsNullOrWhiteSpace(command.Sku) || string.IsNullOrWhiteSpace(command.Name))
    {
        return Results.Problem("Variant SKU and Name are required.", statusCode: 400);
    }

    var success = await catalog.UpdateVariantAsync(productId, variantId, command);
    return success
        ? Results.Ok(new { success = true })
        : Results.Problem("Variant not found.", statusCode: 404);
}).WithName("AdminUpdateVariant");

adminApi.MapDelete("/products/{productId:guid}/variants/{variantId:guid}", async (
    Guid productId,
    Guid variantId,
    ICatalogModule catalog) =>
{
    try
    {
        var success = await catalog.DeleteVariantAsync(productId, variantId);
        return success
            ? Results.Ok(new { success = true })
            : Results.Problem("Variant not found.", statusCode: 404);
    }
    catch (InvalidOperationException ex)
    {
        return Results.Problem(ex.Message, statusCode: 400);
    }
}).WithName("AdminDeleteVariant");

adminApi.MapPost("/categories", async (CreateCategoryCommand command, ICatalogModule catalog) =>
{
    var id = await catalog.CreateCategoryAsync(command);
    return Results.Created($"/api/v1/categories", new { id });
}).WithName("AdminCreateCategory");

// --- Admin Media Upload ---
adminApi.MapPost("/media/upload", async (IFormFile file, IFileStorageService storage) =>
{
    if (file == null || file.Length == 0)
    {
        return Results.Problem("No file provided.", statusCode: 400);
    }

    // Max 5 MB
    if (file.Length > 5 * 1024 * 1024)
    {
        return Results.Problem("File size exceeds 5MB limit.", statusCode: 400);
    }

    var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
    if (!AllowedImageExtensions.Contains(ext))
    {
        return Results.Problem("Only JPG, PNG, and WebP images are permitted.", statusCode: 400);
    }

    await using var stream = file.OpenReadStream();
    var url = await storage.SaveFileAsync(stream, file.FileName, file.ContentType);

    return Results.Ok(new { url });
}).DisableAntiforgery().WithName("AdminUploadMedia");

// --- Admin Orders & Payments Management ---
adminApi.MapGet("/orders", async (
    OrderStatus? status,
    string? searchTerm,
    int? page,
    int? pageSize,
    IOrdersModule orders) =>
{
    var query = new OrderQueryParameters(status, searchTerm, page ?? 1, pageSize ?? 20);
    var result = await orders.ListOrdersAsync(query);
    return Results.Ok(result);
}).WithName("AdminListOrders");

adminApi.MapPatch("/orders/{orderId:guid}/status", async (
    Guid orderId,
    UpdateOrderStatusRequest request,
    IOrdersModule orders) =>
{
    var result = await orders.UpdateOrderStatusAsync(orderId, request.NewStatus, request.Notes);
    return result.Success
        ? Results.Ok(result)
        : Results.Problem(result.Message ?? "Failed to update order status.", statusCode: 400);
}).WithName("AdminUpdateOrderStatus");

adminApi.MapPost("/payments/{paymentId:guid}/verify", async (
    Guid paymentId,
    VerifyPaymentRequest request,
    IPaymentsModule payments,
    IOrdersModule orders) =>
{
    var result = await payments.VerifyManualPaymentAsync(paymentId, request.IsVerified, request.AdminNotes);
    if (!result.Success)
    {
        return Results.Problem(result.Message ?? "Payment verification failed.", statusCode: 400);
    }

    // When payment is approved as Paid, automatically transition the order from PendingPayment to Processing
    if (request.IsVerified && result.OrderId.HasValue)
    {
        await orders.UpdateOrderStatusAsync(
            result.OrderId.Value,
            OrderStatus.Processing,
            "Payment verified by administrator. MFS TrxID confirmed."
        );
    }

    return Results.Ok(result);
}).WithName("AdminVerifyPayment");

// --- Admin Inventory Management ---
adminApi.MapGet("/inventory", async (IInventoryModule inventory) =>
{
    var stockLevels = await inventory.ListStockLevelsAsync();
    return Results.Ok(stockLevels);
}).WithName("AdminListInventory");

adminApi.MapPost("/inventory/adjust", async (StockAdjustmentCommand command, IInventoryModule inventory) =>
{
    if (string.IsNullOrWhiteSpace(command.Reason))
    {
        return Results.Problem("Reason is mandatory for stock adjustments.", statusCode: 400);
    }

    var success = await inventory.AdjustStockAsync(command);
    return success
        ? Results.Ok(new { success = true })
        : Results.Problem("Failed to adjust stock.", statusCode: 400);
}).WithName("AdminAdjustStock");

app.Run();

// Helper to extract session token from Authorization header or cookie
static string? ExtractToken(HttpContext context)
{
    var authHeader = context.Request.Headers.Authorization.ToString();
    if (!string.IsNullOrWhiteSpace(authHeader) && authHeader.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
    {
        return authHeader["Bearer ".Length..].Trim();
    }

    if (context.Request.Cookies.TryGetValue("admin_session", out var cookieToken) && !string.IsNullOrWhiteSpace(cookieToken))
    {
        return cookieToken;
    }

    return null;
}

static string? ExtractUserToken(HttpContext context)
{
    var authHeader = context.Request.Headers.Authorization.ToString();
    if (!string.IsNullOrWhiteSpace(authHeader) && authHeader.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
    {
        return authHeader["Bearer ".Length..].Trim();
    }

    if (context.Request.Cookies.TryGetValue("user_session", out var cookieToken) && !string.IsNullOrWhiteSpace(cookieToken))
    {
        return cookieToken;
    }

    return null;
}

public partial class Program
{
    private static readonly string[] AllowedImageExtensions = [".jpg", ".jpeg", ".png", ".webp"];
}
