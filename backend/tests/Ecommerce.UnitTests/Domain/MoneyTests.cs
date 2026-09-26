using Ecommerce.Domain.ValueObjects;

namespace Ecommerce.UnitTests.Domain;

public class MoneyTests
{
    [Fact]
    public void FromBdt_CreatesValidMoneyWithDefaultCurrency()
    {
        var money = Money.FromBdt(1500.50m);

        Assert.Equal(1500.50m, money.Amount);
        Assert.Equal("BDT", money.Currency);
    }

    [Fact]
    public void Constructor_RoundsToTwoDecimalPlaces()
    {
        var money = new Money(99.999m);

        Assert.Equal(100.00m, money.Amount);
    }

    [Fact]
    public void Constructor_ThrowsArgumentOutOfRangeException_WhenAmountIsNegative()
    {
        var ex = Assert.Throws<ArgumentOutOfRangeException>(() => new Money(-10m));

        Assert.Contains("cannot be negative", ex.Message, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public void Addition_CalculatesCorrectSum()
    {
        var m1 = Money.FromBdt(250.25m);
        var m2 = Money.FromBdt(150.75m);

        var total = m1 + m2;

        Assert.Equal(401.00m, total.Amount);
        Assert.Equal("BDT", total.Currency);
    }

    [Fact]
    public void Subtraction_CalculatesCorrectDifference()
    {
        var m1 = Money.FromBdt(500m);
        var m2 = Money.FromBdt(200m);

        var result = m1 - m2;

        Assert.Equal(300m, result.Amount);
    }

    [Fact]
    public void Subtraction_ThrowsInvalidOperationException_WhenResultWouldBeNegative()
    {
        var m1 = Money.FromBdt(100m);
        var m2 = Money.FromBdt(200m);

        Assert.Throws<InvalidOperationException>(() => m1 - m2);
    }

    [Fact]
    public void Multiplication_CalculatesQuantityCorrectly()
    {
        var unitPrice = Money.FromBdt(120m);
        var total = unitPrice * 3;

        Assert.Equal(360m, total.Amount);
    }

    [Fact]
    public void ToString_FormatsWithCurrencyAndTwoDecimals()
    {
        var money = Money.FromBdt(12500m);

        Assert.Equal("BDT 12,500.00", money.ToString());
    }
}
