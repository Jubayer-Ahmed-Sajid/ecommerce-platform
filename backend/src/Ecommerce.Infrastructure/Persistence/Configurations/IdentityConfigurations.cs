using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Ecommerce.Modules.Identity.Domain;

namespace Ecommerce.Infrastructure.Persistence.Configurations;

public class IdentityConfigurations :
    IEntityTypeConfiguration<User>,
    IEntityTypeConfiguration<Role>,
    IEntityTypeConfiguration<UserRole>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        builder.ToTable("usr_users");
        builder.HasKey(u => u.Id);

        builder.Property(u => u.Email).HasMaxLength(256).IsRequired();
        builder.HasIndex(u => u.Email).IsUnique();

        builder.Property(u => u.PasswordHash).HasMaxLength(500).IsRequired();
        builder.Property(u => u.FullName).HasMaxLength(200).IsRequired();
        builder.Property(u => u.PhoneNumber).HasMaxLength(32);
        builder.Property(u => u.IsActive).IsRequired();

        builder.HasMany(u => u.UserRoles)
            .WithOne(ur => ur.User)
            .HasForeignKey(ur => ur.UserId)
            .OnDelete(DeleteBehavior.Cascade);
    }

    public void Configure(EntityTypeBuilder<Role> builder)
    {
        builder.ToTable("usr_roles");
        builder.HasKey(r => r.Id);

        builder.Property(r => r.Name).HasMaxLength(100).IsRequired();
        builder.HasIndex(r => r.Name).IsUnique();

        builder.Property(r => r.Description).HasMaxLength(300);

        builder.HasMany(r => r.UserRoles)
            .WithOne(ur => ur.Role)
            .HasForeignKey(ur => ur.RoleId)
            .OnDelete(DeleteBehavior.Cascade);
    }

    public void Configure(EntityTypeBuilder<UserRole> builder)
    {
        builder.ToTable("usr_user_roles");
        builder.HasKey(ur => new { ur.UserId, ur.RoleId });
    }
}
