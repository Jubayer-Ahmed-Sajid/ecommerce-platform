using Ecommerce.Domain.Common;

namespace Ecommerce.UnitTests.Domain;

public class ResultTests
{
    [Fact]
    public void Success_CreatesSuccessfulResult()
    {
        var result = Result.Success();

        Assert.True(result.IsSuccess);
        Assert.False(result.IsFailure);
        Assert.Null(result.Error);
    }

    [Fact]
    public void Failure_CreatesFailedResult()
    {
        var result = Result.Failure("Product not found");

        Assert.False(result.IsSuccess);
        Assert.True(result.IsFailure);
        Assert.Equal("Product not found", result.Error);
    }

    [Fact]
    public void TypedSuccess_ExposesValue()
    {
        var result = Result.Success("order-123");

        Assert.True(result.IsSuccess);
        Assert.Equal("order-123", result.Value);
    }

    [Fact]
    public void TypedFailure_ThrowsWhenAccessingValue()
    {
        var result = Result.Failure<string>("Inventory depleted");

        Assert.True(result.IsFailure);
        var ex = Assert.Throws<InvalidOperationException>(() => result.Value);
        Assert.Contains("Inventory depleted", ex.Message, StringComparison.Ordinal);
    }

    [Fact]
    public void ValidationFailure_StoresValidationErrorsDictionary()
    {
        var errors = new Dictionary<string, string[]>
        {
            { "PhoneNumber", ["Invalid Bangladeshi mobile phone format."] }
        };

        var result = Result.ValidationFailure<Guid>("Validation failed", errors);

        Assert.True(result.IsFailure);
        Assert.NotNull(result.ValidationErrors);
        Assert.True(result.ValidationErrors.ContainsKey("PhoneNumber"));
    }
}
