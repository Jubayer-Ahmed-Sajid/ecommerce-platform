using System.Reflection;
using Ecommerce.Modules.Catalog;
using Ecommerce.Modules.Customers;
using Ecommerce.Modules.Identity;
using Ecommerce.Modules.Inventory;
using Ecommerce.Modules.Orders;
using Ecommerce.Modules.Payments;

namespace Ecommerce.UnitTests.Architecture;

public class ModuleBoundaryArchitectureTests
{
    private static readonly Assembly[] AllModuleAssemblies =
    [
        typeof(ICatalogModule).Assembly,
        typeof(IInventoryModule).Assembly,
        typeof(ICustomersModule).Assembly,
        typeof(IOrdersModule).Assembly,
        typeof(IPaymentsModule).Assembly,
        typeof(IIdentityModule).Assembly
    ];

    private static readonly Assembly[] PeerModuleAssemblies =
    [
        typeof(ICatalogModule).Assembly,
        typeof(IInventoryModule).Assembly,
        typeof(ICustomersModule).Assembly,
        typeof(IPaymentsModule).Assembly,
        typeof(IIdentityModule).Assembly
    ];

    [Fact]
    public void Modules_MustNotReference_Infrastructure()
    {
        foreach (var assembly in AllModuleAssemblies)
        {
            var refs = assembly.GetReferencedAssemblies();
            var hasInfra = refs.Any(r => r.Name != null && r.Name.Equals("Ecommerce.Infrastructure", StringComparison.OrdinalIgnoreCase));

            Assert.False(hasInfra, $"Module '{assembly.GetName().Name}' must NOT reference Ecommerce.Infrastructure.");
        }
    }

    [Fact]
    public void Modules_MustNotReference_ApiHost()
    {
        foreach (var assembly in AllModuleAssemblies)
        {
            var refs = assembly.GetReferencedAssemblies();
            var hasApi = refs.Any(r => r.Name != null && r.Name.Equals("Ecommerce.Api", StringComparison.OrdinalIgnoreCase));

            Assert.False(hasApi, $"Module '{assembly.GetName().Name}' must NOT reference Ecommerce.Api.");
        }
    }

    [Fact]
    public void Modules_MustNotReference_AspNetCoreHttpOrMvc()
    {
        foreach (var assembly in AllModuleAssemblies)
        {
            var refs = assembly.GetReferencedAssemblies();
            var hasHttpLeak = refs.Any(r => r.Name != null && (
                r.Name.StartsWith("Microsoft.AspNetCore.Http", StringComparison.OrdinalIgnoreCase) ||
                r.Name.StartsWith("Microsoft.AspNetCore.Mvc", StringComparison.OrdinalIgnoreCase)));

            Assert.False(hasHttpLeak, $"Module '{assembly.GetName().Name}' must NOT reference ASP.NET Core Http/Mvc namespaces.");
        }
    }

    [Fact]
    public void PeerModules_MustNotReference_OrdersModule()
    {
        foreach (var assembly in PeerModuleAssemblies)
        {
            var refs = assembly.GetReferencedAssemblies();
            var hasOrders = refs.Any(r => r.Name != null && r.Name.Equals("Ecommerce.Modules.Orders", StringComparison.OrdinalIgnoreCase));

            Assert.False(hasOrders, $"Peer module '{assembly.GetName().Name}' must NOT reference Ecommerce.Modules.Orders.");
        }
    }

    [Theory]
    [InlineData(typeof(ICatalogModule), "ICatalogModule")]
    [InlineData(typeof(IInventoryModule), "IInventoryModule")]
    [InlineData(typeof(ICustomersModule), "ICustomersModule")]
    [InlineData(typeof(IOrdersModule), "IOrdersModule")]
    [InlineData(typeof(IPaymentsModule), "IPaymentsModule")]
    [InlineData(typeof(IIdentityModule), "IIdentityModule")]
    public void PublicModuleInterfaces_MustFollowStandardNaming(Type interfaceType, string expectedName)
    {
        Assert.True(interfaceType.IsInterface, $"{expectedName} must be an interface.");
        Assert.Equal(expectedName, interfaceType.Name);
    }
}
