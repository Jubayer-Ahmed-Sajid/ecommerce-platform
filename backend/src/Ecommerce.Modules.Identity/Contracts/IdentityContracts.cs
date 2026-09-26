namespace Ecommerce.Modules.Identity.Contracts;

public record AuthResultDto(
    bool IsSuccess,
    string? Token,
    string? ErrorMessage,
    DateTimeOffset? ExpiresAt
);

public record UserClaimsDto(
    Guid UserId,
    string Email,
    string Role,
    IReadOnlyList<string> Permissions
);

public record RegisterUserDto(
    string FullName,
    string Email,
    string Password,
    string? PhoneNumber = null
);

public record UserProfileDto(
    Guid Id,
    string FullName,
    string Email,
    string? PhoneNumber,
    string Role
);
