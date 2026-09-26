namespace Ecommerce.Domain.Common;

/// <summary>
/// Explicit result type for operations with no return value.
/// Hosts static factory methods for both non-generic and generic results to comply with CA1000.
/// </summary>
public class Result
{
    protected Result(bool isSuccess, string? error, IDictionary<string, string[]>? validationErrors = null)
    {
        if (isSuccess && !string.IsNullOrEmpty(error))
        {
            throw new InvalidOperationException("A successful result cannot contain an error message.");
        }

        if (!isSuccess && string.IsNullOrEmpty(error))
        {
            throw new InvalidOperationException("A failed result must specify an error message.");
        }

        IsSuccess = isSuccess;
        Error = error;
        ValidationErrors = validationErrors;
    }

    public bool IsSuccess { get; }

    public bool IsFailure => !IsSuccess;

    public string? Error { get; }

    public IDictionary<string, string[]>? ValidationErrors { get; }

    public static Result Success() => new(true, null);

    public static Result Failure(string error) => new(false, error);

    public static Result ValidationFailure(string error, IDictionary<string, string[]> validationErrors) =>
        new(false, error, validationErrors);

    public static Result<T> Success<T>(T value) => new(true, value, null);

    public static Result<T> Failure<T>(string error) => new(false, default, error);

    public static Result<T> ValidationFailure<T>(string error, IDictionary<string, string[]> validationErrors) =>
        new(false, default, error, validationErrors);
}

/// <summary>
/// Explicit result type for operations returning a typed value.
/// Instantiated via static factories on <see cref="Result"/>.
/// </summary>
public class Result<T> : Result
{
    private readonly T? _value;

    internal Result(bool isSuccess, T? value, string? error, IDictionary<string, string[]>? validationErrors = null)
        : base(isSuccess, error, validationErrors)
    {
        _value = value;
    }

    public T Value => IsSuccess
        ? _value!
        : throw new InvalidOperationException($"Cannot access Value of a failed Result. Error: {Error}");
}
