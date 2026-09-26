using Ecommerce.Modules.Identity.Contracts;

namespace Ecommerce.Modules.Identity;

public interface IIdentityModule
{
    Task<AuthResultDto> AuthenticateAdminAsync(string email, string password, CancellationToken ct = default);
    Task<AuthResultDto> AuthenticateUserAsync(string email, string password, CancellationToken ct = default);
    Task<AuthResultDto> RegisterUserAsync(RegisterUserDto request, CancellationToken ct = default);
    Task<UserProfileDto?> GetUserProfileAsync(Guid userId, CancellationToken ct = default);
    Task<UserClaimsDto?> ValidateTokenAsync(string token, CancellationToken ct = default);
}
