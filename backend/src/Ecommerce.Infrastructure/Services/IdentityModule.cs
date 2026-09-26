using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using Ecommerce.Infrastructure.Persistence;
using Ecommerce.Modules.Identity;
using Ecommerce.Modules.Identity.Contracts;
using Ecommerce.Modules.Identity.Domain;
using Ecommerce.Modules.Identity.Services;

namespace Ecommerce.Infrastructure.Services;

public class IdentityModule : IIdentityModule
{
    private readonly EcommerceDbContext _dbContext;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IConfiguration _configuration;

    public IdentityModule(
        EcommerceDbContext dbContext,
        IPasswordHasher passwordHasher,
        IConfiguration configuration)
    {
        _dbContext = dbContext;
        _passwordHasher = passwordHasher;
        _configuration = configuration;
    }

    public async Task<AuthResultDto> AuthenticateAdminAsync(string email, string password, CancellationToken ct = default)
    {
        var normalizedEmail = email.ToLowerInvariant().Trim();

        var user = await _dbContext.Users
            .Include(u => u.UserRoles)
            .ThenInclude(ur => ur.Role)
            .FirstOrDefaultAsync(u => u.Email == normalizedEmail, ct);

        if (user == null || !user.IsActive)
        {
            return new AuthResultDto(false, null, "Invalid credentials.", null);
        }

        // Lockout Check
        if (user.LockoutEndUtc.HasValue && user.LockoutEndUtc.Value > DateTimeOffset.UtcNow)
        {
            var remainingMinutes = Math.Ceiling((user.LockoutEndUtc.Value - DateTimeOffset.UtcNow).TotalMinutes);
            return new AuthResultDto(false, null, $"Account is temporarily locked. Try again in {remainingMinutes} minute(s).", null);
        }

        // Verify Password
        if (!_passwordHasher.VerifyPassword(password, user.PasswordHash))
        {
            user.FailedLoginAttempts++;
            if (user.FailedLoginAttempts >= 5)
            {
                user.LockoutEndUtc = DateTimeOffset.UtcNow.AddMinutes(15);
            }
            user.MarkUpdated();
            await _dbContext.SaveChangesAsync(ct);

            return new AuthResultDto(false, null, "Invalid credentials.", null);
        }

        // Reset lockout on success
        user.FailedLoginAttempts = 0;
        user.LockoutEndUtc = null;
        user.MarkUpdated();
        await _dbContext.SaveChangesAsync(ct);

        // Verify Admin Role
        var roles = user.UserRoles.Select(ur => ur.Role.Name).ToList();
        if (!roles.Contains("Admin", StringComparer.OrdinalIgnoreCase))
        {
            return new AuthResultDto(false, null, "User is not authorized for administration.", null);
        }

        // Generate JWT Token
        var tokenHandler = new JwtSecurityTokenHandler();
        var secretKey = _configuration["Jwt:SecretKey"] ?? "super_secure_default_32_characters_secret_key!";
        var key = Encoding.UTF8.GetBytes(secretKey);
        var expiresAt = DateTimeOffset.UtcNow.AddHours(8);

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity([
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Name, user.FullName),
                new Claim(ClaimTypes.Role, "Admin")
            ]),
            Expires = expiresAt.UtcDateTime,
            Issuer = _configuration["Jwt:Issuer"] ?? "ecommerce-api",
            Audience = _configuration["Jwt:Audience"] ?? "ecommerce-admin",
            SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
        };

        var token = tokenHandler.CreateToken(tokenDescriptor);
        var tokenString = tokenHandler.WriteToken(token);

        return new AuthResultDto(true, tokenString, null, expiresAt);
    }

    public async Task<AuthResultDto> AuthenticateUserAsync(string email, string password, CancellationToken ct = default)
    {
        var normalizedEmail = email.ToLowerInvariant().Trim();

        var user = await _dbContext.Users
            .Include(u => u.UserRoles)
            .ThenInclude(ur => ur.Role)
            .FirstOrDefaultAsync(u => u.Email == normalizedEmail, ct);

        if (user == null || !user.IsActive)
        {
            return new AuthResultDto(false, null, "Invalid email or password.", null);
        }

        // Lockout Check
        if (user.LockoutEndUtc.HasValue && user.LockoutEndUtc.Value > DateTimeOffset.UtcNow)
        {
            var remainingMinutes = Math.Ceiling((user.LockoutEndUtc.Value - DateTimeOffset.UtcNow).TotalMinutes);
            return new AuthResultDto(false, null, $"Account is temporarily locked. Try again in {remainingMinutes} minute(s).", null);
        }

        // Verify Password
        if (!_passwordHasher.VerifyPassword(password, user.PasswordHash))
        {
            user.FailedLoginAttempts++;
            if (user.FailedLoginAttempts >= 5)
            {
                user.LockoutEndUtc = DateTimeOffset.UtcNow.AddMinutes(15);
            }
            user.MarkUpdated();
            await _dbContext.SaveChangesAsync(ct);

            return new AuthResultDto(false, null, "Invalid email or password.", null);
        }

        // Reset lockout on success
        user.FailedLoginAttempts = 0;
        user.LockoutEndUtc = null;
        user.MarkUpdated();
        await _dbContext.SaveChangesAsync(ct);

        var role = user.UserRoles.Select(ur => ur.Role.Name).FirstOrDefault() ?? "Customer";

        // Generate JWT Token
        var tokenHandler = new JwtSecurityTokenHandler();
        var secretKey = _configuration["Jwt:SecretKey"] ?? "super_secure_default_32_characters_secret_key!";
        var key = Encoding.UTF8.GetBytes(secretKey);
        var expiresAt = DateTimeOffset.UtcNow.AddDays(7);

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity([
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Name, user.FullName),
                new Claim(ClaimTypes.Role, role)
            ]),
            Expires = expiresAt.UtcDateTime,
            Issuer = _configuration["Jwt:Issuer"] ?? "ecommerce-api",
            Audience = _configuration["Jwt:Audience"] ?? "ecommerce-storefront",
            SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
        };

        var token = tokenHandler.CreateToken(tokenDescriptor);
        var tokenString = tokenHandler.WriteToken(token);

        return new AuthResultDto(true, tokenString, null, expiresAt);
    }

    public async Task<AuthResultDto> RegisterUserAsync(RegisterUserDto request, CancellationToken ct = default)
    {
        var normalizedEmail = request.Email.ToLowerInvariant().Trim();

        if (string.IsNullOrWhiteSpace(request.FullName))
        {
            return new AuthResultDto(false, null, "Full name is required.", null);
        }

        if (string.IsNullOrWhiteSpace(request.Email) || !request.Email.Contains('@'))
        {
            return new AuthResultDto(false, null, "A valid email address is required.", null);
        }

        if (string.IsNullOrWhiteSpace(request.Password) || request.Password.Length < 6)
        {
            return new AuthResultDto(false, null, "Password must be at least 6 characters.", null);
        }

        var existingUser = await _dbContext.Users.AnyAsync(u => u.Email == normalizedEmail, ct);
        if (existingUser)
        {
            return new AuthResultDto(false, null, "An account with this email already exists.", null);
        }

        var customerRole = await _dbContext.Roles.FirstOrDefaultAsync(r => r.Name == "Customer", ct);
        if (customerRole == null)
        {
            customerRole = new Role("Customer", "Registered customer account");
            _dbContext.Roles.Add(customerRole);
            await _dbContext.SaveChangesAsync(ct);
        }

        var user = new User(
            normalizedEmail,
            _passwordHasher.HashPassword(request.Password),
            request.FullName.Trim(),
            request.PhoneNumber?.Trim()
        );

        _dbContext.Users.Add(user);
        await _dbContext.SaveChangesAsync(ct);

        _dbContext.UserRoles.Add(new UserRole(user.Id, customerRole.Id));
        await _dbContext.SaveChangesAsync(ct);

        return await AuthenticateUserAsync(normalizedEmail, request.Password, ct);
    }

    public async Task<UserProfileDto?> GetUserProfileAsync(Guid userId, CancellationToken ct = default)
    {
        var user = await _dbContext.Users
            .Include(u => u.UserRoles)
            .ThenInclude(ur => ur.Role)
            .FirstOrDefaultAsync(u => u.Id == userId, ct);

        if (user == null || !user.IsActive)
        {
            return null;
        }

        var role = user.UserRoles.Select(ur => ur.Role.Name).FirstOrDefault() ?? "Customer";
        return new UserProfileDto(user.Id, user.FullName, user.Email, user.PhoneNumber, role);
    }

    public Task<UserClaimsDto?> ValidateTokenAsync(string token, CancellationToken ct = default)
    {
        var tokenHandler = new JwtSecurityTokenHandler();
        var secretKey = _configuration["Jwt:SecretKey"] ?? "super_secure_default_32_characters_secret_key!";
        var key = Encoding.UTF8.GetBytes(secretKey);

        try
        {
            var principal = tokenHandler.ValidateToken(token, new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(key),
                ValidateIssuer = false,
                ValidateAudience = false,
                ClockSkew = TimeSpan.FromMinutes(5)
            }, out _);

            var userIdClaim = principal.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var emailClaim = principal.FindFirst(ClaimTypes.Email)?.Value;
            var roleClaim = principal.FindFirst(ClaimTypes.Role)?.Value ?? "Customer";

            if (Guid.TryParse(userIdClaim, out var userId) && !string.IsNullOrWhiteSpace(emailClaim))
            {
                var permissions = roleClaim.Equals("Admin", StringComparison.OrdinalIgnoreCase)
                    ? (IReadOnlyList<string>)["admin:all"]
                    : (IReadOnlyList<string>)["user:read"];

                return Task.FromResult<UserClaimsDto?>(new UserClaimsDto(userId, emailClaim, roleClaim, permissions));
            }
        }
        catch
        {
            // Token invalid or expired
        }

        return Task.FromResult<UserClaimsDto?>(null);
    }
}
