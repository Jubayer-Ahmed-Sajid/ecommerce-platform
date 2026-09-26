using System.Reflection;
using Ecommerce.Domain.Common;

namespace Ecommerce.UnitTests.Architecture;

public class DomainIsolationArchitectureTests
{
    private static readonly Assembly DomainAssembly = typeof(Entity<>).Assembly;

    [Fact]
    public void Domain_MustNotReference_AspNetCore()
    {
        var referencedAssemblies = DomainAssembly.GetReferencedAssemblies();

        var hasAspNetCore = referencedAssemblies.Any(a =>
            a.Name != null && a.Name.StartsWith("Microsoft.AspNetCore", StringComparison.OrdinalIgnoreCase));

        Assert.False(hasAspNetCore, "Ecommerce.Domain must NOT reference any Microsoft.AspNetCore assembly.");
    }

    [Fact]
    public void Domain_MustNotReference_EntityFrameworkCore()
    {
        var referencedAssemblies = DomainAssembly.GetReferencedAssemblies();

        var hasEfCore = referencedAssemblies.Any(a =>
            a.Name != null && a.Name.StartsWith("Microsoft.EntityFrameworkCore", StringComparison.OrdinalIgnoreCase));

        Assert.False(hasEfCore, "Ecommerce.Domain must NOT reference Microsoft.EntityFrameworkCore.");
    }

    [Fact]
    public void Domain_MustNotReference_BusinessModules()
    {
        var referencedAssemblies = DomainAssembly.GetReferencedAssemblies();

        var hasModules = referencedAssemblies.Any(a =>
            a.Name != null && a.Name.StartsWith("Ecommerce.Modules", StringComparison.OrdinalIgnoreCase));

        Assert.False(hasModules, "Ecommerce.Domain must NOT reference any Ecommerce.Modules assembly.");
    }

    [Fact]
    public void Domain_MustNotReference_InfrastructureOrApi()
    {
        var referencedAssemblies = DomainAssembly.GetReferencedAssemblies();

        var hasInfraOrApi = referencedAssemblies.Any(a =>
            a.Name != null && (a.Name.Equals("Ecommerce.Infrastructure", StringComparison.OrdinalIgnoreCase) ||
                               a.Name.Equals("Ecommerce.Api", StringComparison.OrdinalIgnoreCase)));

        Assert.False(hasInfraOrApi, "Ecommerce.Domain must NOT reference Ecommerce.Infrastructure or Ecommerce.Api.");
    }
}
