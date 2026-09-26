using Microsoft.EntityFrameworkCore;
using Ecommerce.Modules.Catalog.Domain;
using Ecommerce.Modules.Inventory.Domain;
using Ecommerce.Modules.Customers.Domain;
using Ecommerce.Modules.Orders.Domain;
using Ecommerce.Modules.Payments.Domain;
using Ecommerce.Modules.Identity.Domain;

namespace Ecommerce.Infrastructure.Persistence;

public class EcommerceDbContext : DbContext
{
    public EcommerceDbContext(DbContextOptions<EcommerceDbContext> options)
        : base(options)
    {
    }

    // Catalog Module (cat_*)
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Product> Products => Set<Product>();
    public DbSet<ProductVariant> ProductVariants => Set<ProductVariant>();
    public DbSet<ProductImage> ProductImages => Set<ProductImage>();

    // Inventory Module (inv_*)
    public DbSet<StockItem> StockItems => Set<StockItem>();
    public DbSet<StockLog> StockLogs => Set<StockLog>();

    // Customers Module (cus_*)
    public DbSet<Customer> Customers => Set<Customer>();
    public DbSet<CustomerAddress> CustomerAddresses => Set<CustomerAddress>();

    // Orders Module (ord_*)
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderItem> OrderItems => Set<OrderItem>();
    public DbSet<OrderStatusHistory> OrderStatusHistories => Set<OrderStatusHistory>();

    // Payments Module (pay_*)
    public DbSet<Payment> Payments => Set<Payment>();
    public DbSet<PaymentTransaction> PaymentTransactions => Set<PaymentTransaction>();

    // Identity Module (usr_*)
    public DbSet<User> Users => Set<User>();
    public DbSet<Role> Roles => Set<Role>();
    public DbSet<UserRole> UserRoles => Set<UserRole>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Apply entity configurations defined in this assembly
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(EcommerceDbContext).Assembly);
    }
}
