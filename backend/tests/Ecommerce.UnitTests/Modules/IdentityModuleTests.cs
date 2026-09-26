using Ecommerce.Modules.Identity.Services;

namespace Ecommerce.UnitTests.Modules;

public class IdentityModuleTests
{
    private readonly PasswordHasher _hasher = new();

    [Fact]
    public void HashPassword_GeneratesSaltedPbkdf2Hash()
    {
        var password = "SecurePassword123!";
        var hash = _hasher.HashPassword(password);

        Assert.NotNull(hash);
        Assert.Contains(":", hash);
        var parts = hash.Split(':');
        Assert.Equal(2, parts.Length);
    }

    [Fact]
    public void VerifyPassword_ReturnsTrue_ForCorrectPassword()
    {
        var password = "AdminSecretKey99!";
        var hash = _hasher.HashPassword(password);

        var isValid = _hasher.VerifyPassword(password, hash);

        Assert.True(isValid);
    }

    [Fact]
    public void VerifyPassword_ReturnsFalse_ForIncorrectPassword()
    {
        var password = "CorrectPassword123!";
        var wrongPassword = "WrongPassword456!";
        var hash = _hasher.HashPassword(password);

        var isValid = _hasher.VerifyPassword(wrongPassword, hash);

        Assert.False(isValid);
    }

    [Fact]
    public void HashPassword_ProducesDifferentHashes_ForSamePasswordDueToSalt()
    {
        var password = "IdenticalPassword!";
        var hash1 = _hasher.HashPassword(password);
        var hash2 = _hasher.HashPassword(password);

        Assert.NotEqual(hash1, hash2);
        Assert.True(_hasher.VerifyPassword(password, hash1));
        Assert.True(_hasher.VerifyPassword(password, hash2));
    }
}
