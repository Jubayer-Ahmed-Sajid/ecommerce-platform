using Microsoft.EntityFrameworkCore;
using Ecommerce.Domain.Enums;
using Ecommerce.Infrastructure.Persistence;
using Ecommerce.Infrastructure.Services;
using Ecommerce.Modules.Payments.Contracts;

namespace Ecommerce.UnitTests.Modules;

public class PaymentsModuleTests
{
    private static EcommerceDbContext CreateInMemoryDbContext()
    {
        var options = new DbContextOptionsBuilder<EcommerceDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .ConfigureWarnings(w => w.Ignore(Microsoft.EntityFrameworkCore.Diagnostics.InMemoryEventId.TransactionIgnoredWarning))
            .Options;

        return new EcommerceDbContext(options);
    }

    [Fact]
    public async Task VerifyManualPaymentAsync_Succeeds_AndReturnsOrderId()
    {
        var db = CreateInMemoryDbContext();
        var payments = new PaymentsModule(db);

        var orderId = Guid.NewGuid();
        var payment = await payments.CreatePaymentIntentAsync(
            orderId,
            1500m,
            PaymentMethod.Bkash,
            new PaymentDetails("01712345678", "TRX123456", "Paid via personal send money")
        );

        Assert.Equal(PaymentStatus.Pending, payment.Status);

        var verificationResult = await payments.VerifyManualPaymentAsync(payment.Id, true, "Verified with bank SMS");

        Assert.True(verificationResult.Success);
        Assert.Equal(PaymentStatus.Paid, verificationResult.Status);
        Assert.Equal(orderId, verificationResult.OrderId);

        var updatedPayment = await payments.GetPaymentByOrderIdAsync(orderId);
        Assert.NotNull(updatedPayment);
        Assert.Equal(PaymentStatus.Paid, updatedPayment.Status);
        Assert.NotNull(updatedPayment.VerifiedAtUtc);
    }

    [Fact]
    public async Task VerifyManualPaymentAsync_PreventsReplay_WhenTrxIdAlreadyPaidOnAnotherOrder()
    {
        var db = CreateInMemoryDbContext();
        var payments = new PaymentsModule(db);

        var orderId1 = Guid.NewGuid();
        var orderId2 = Guid.NewGuid();

        // Customer 1 pays with TRX-UNIQUE-999
        var payment1 = await payments.CreatePaymentIntentAsync(
            orderId1,
            2000m,
            PaymentMethod.Bkash,
            new PaymentDetails("01711111111", "TRX-UNIQUE-999", "Customer 1")
        );

        // Admin verifies payment 1 successfully
        var result1 = await payments.VerifyManualPaymentAsync(payment1.Id, true, "Approved");
        Assert.True(result1.Success);

        // Customer 2 attempts to replay TRX-UNIQUE-999 on a different order
        var payment2 = await payments.CreatePaymentIntentAsync(
            orderId2,
            2000m,
            PaymentMethod.Bkash,
            new PaymentDetails("01722222222", "TRX-UNIQUE-999", "Customer 2 (Replay)")
        );

        // Admin attempts to verify payment 2
        var result2 = await payments.VerifyManualPaymentAsync(payment2.Id, true, "Attempting approval");

        // Must be rejected by the anti-replay guard!
        Assert.False(result2.Success);
        Assert.Equal(PaymentStatus.Failed, result2.Status);
        Assert.Contains("already been verified and approved", result2.Message, StringComparison.OrdinalIgnoreCase);
    }
}
