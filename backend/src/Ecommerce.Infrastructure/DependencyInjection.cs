using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Ecommerce.Infrastructure.Persistence;
using Ecommerce.Infrastructure.Services;
using Ecommerce.Infrastructure.Storage;
using Ecommerce.Modules.Catalog;
using Ecommerce.Modules.Customers;
using Ecommerce.Modules.Identity;
using Ecommerce.Modules.Identity.Services;
using Ecommerce.Modules.Inventory;
using Ecommerce.Modules.Orders;
using Ecommerce.Modules.Payments;

namespace Ecommerce.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("DefaultConnection");
        if (!string.IsNullOrWhiteSpace(connectionString) && !connectionString.Equals("InMemory", StringComparison.OrdinalIgnoreCase))
        {
            services.AddDbContext<EcommerceDbContext>(options =>
            {
                options.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString));
            });
        }
        else
        {
            services.AddDbContext<EcommerceDbContext>(options =>
            {
                options.UseInMemoryDatabase("EcommerceDb")
                       .ConfigureWarnings(w => w.Ignore(Microsoft.EntityFrameworkCore.Diagnostics.InMemoryEventId.TransactionIgnoredWarning));
            });
        }

        var uploadDirectory = configuration["Storage:UploadDirectory"] ?? "uploads";
        var baseUrl = configuration["Storage:BaseUrl"] ?? "/uploads";
        services.AddSingleton<IFileStorageService>(new LocalFileStorageService(uploadDirectory, baseUrl));

        services.AddSingleton<IPasswordHasher, PasswordHasher>();

        services.AddScoped<ICatalogModule, CatalogModule>();
        services.AddScoped<IInventoryModule, InventoryModule>();
        services.AddScoped<ICustomersModule, CustomersModule>();
        services.AddScoped<IPaymentsModule, PaymentsModule>();
        services.AddScoped<IOrdersModule, OrdersModule>();
        services.AddScoped<IIdentityModule, IdentityModule>();

        return services;
    }
}
