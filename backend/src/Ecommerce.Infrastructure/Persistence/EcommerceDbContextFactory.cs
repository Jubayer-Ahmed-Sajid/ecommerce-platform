using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace Ecommerce.Infrastructure.Persistence;

public class EcommerceDbContextFactory : IDesignTimeDbContextFactory<EcommerceDbContext>
{
    public EcommerceDbContext CreateDbContext(string[] args)
    {
        var optionsBuilder = new DbContextOptionsBuilder<EcommerceDbContext>();
        // Design-time MySQL 8.0 server version for generating authoritative migrations
        var serverVersion = new MySqlServerVersion(new Version(8, 0, 36));
        optionsBuilder.UseMySql(
            "Server=localhost;Port=3306;Database=ecommerce_db;User=root;Password=secret;",
            serverVersion,
            mySqlOptions =>
            {
                mySqlOptions.MigrationsAssembly(typeof(EcommerceDbContext).Assembly.FullName);
            }
        );

        return new EcommerceDbContext(optionsBuilder.Options);
    }
}
