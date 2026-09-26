namespace Ecommerce.Domain.ValueObjects;

/// <summary>
/// Immutable value object representing a monetary amount with currency.
/// Enforces decimal(18,2) precision and non-negative constraints.
/// </summary>
public readonly record struct Money : IComparable<Money>
{
    public const string DefaultCurrency = "BDT";

    public decimal Amount { get; }
    public string Currency { get; }

    public Money(decimal amount, string currency = DefaultCurrency)
    {
        if (amount < 0)
        {
            throw new ArgumentOutOfRangeException(nameof(amount), "Monetary amounts cannot be negative.");
        }

        if (string.IsNullOrWhiteSpace(currency))
        {
            throw new ArgumentException("Currency code cannot be null or empty.", nameof(currency));
        }

        // Standardize to 2 decimal places
        Amount = Math.Round(amount, 2, MidpointRounding.AwayFromZero);
        Currency = currency.Trim().ToUpperInvariant();
    }

    public static Money Zero(string currency = DefaultCurrency) => new(0m, currency);

    public static Money FromBdt(decimal amount) => new(amount, DefaultCurrency);

    public static Money operator +(Money left, Money right)
    {
        EnsureSameCurrency(left, right);
        return new Money(left.Amount + right.Amount, left.Currency);
    }

    public static Money operator -(Money left, Money right)
    {
        EnsureSameCurrency(left, right);
        if (left.Amount < right.Amount)
        {
            throw new InvalidOperationException($"Resulting money amount cannot be negative ({left.Amount} - {right.Amount}).");
        }
        return new Money(left.Amount - right.Amount, left.Currency);
    }

    public static Money operator *(Money money, int quantity)
    {
        if (quantity < 0)
        {
            throw new ArgumentOutOfRangeException(nameof(quantity), "Quantity cannot be negative.");
        }
        return new Money(money.Amount * quantity, money.Currency);
    }

    public static bool operator <(Money left, Money right)
    {
        EnsureSameCurrency(left, right);
        return left.Amount < right.Amount;
    }

    public static bool operator >(Money left, Money right)
    {
        EnsureSameCurrency(left, right);
        return left.Amount > right.Amount;
    }

    public static bool operator <=(Money left, Money right)
    {
        EnsureSameCurrency(left, right);
        return left.Amount <= right.Amount;
    }

    public static bool operator >=(Money left, Money right)
    {
        EnsureSameCurrency(left, right);
        return left.Amount >= right.Amount;
    }

    public int CompareTo(Money other)
    {
        EnsureSameCurrency(this, other);
        return Amount.CompareTo(other.Amount);
    }

    public override string ToString() => $"{Currency} {Amount:N2}";

    private static void EnsureSameCurrency(Money left, Money right)
    {
        if (!string.Equals(left.Currency, right.Currency, StringComparison.OrdinalIgnoreCase))
        {
            throw new InvalidOperationException($"Cannot operate on money with different currencies: '{left.Currency}' vs '{right.Currency}'.");
        }
    }
}
