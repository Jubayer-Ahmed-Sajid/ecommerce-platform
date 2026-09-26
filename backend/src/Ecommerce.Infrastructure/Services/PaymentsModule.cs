using Microsoft.EntityFrameworkCore;
using Ecommerce.Domain.Enums;
using Ecommerce.Infrastructure.Persistence;
using Ecommerce.Modules.Payments;
using Ecommerce.Modules.Payments.Contracts;
using Ecommerce.Modules.Payments.Domain;

namespace Ecommerce.Infrastructure.Services;

public class PaymentsModule : IPaymentsModule
{
    private readonly EcommerceDbContext _dbContext;

    public PaymentsModule(EcommerceDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<PaymentRecordDto> CreatePaymentIntentAsync(Guid orderId, decimal amount, PaymentMethod method, PaymentDetails details, CancellationToken ct = default)
    {
        var payment = new Payment(
            orderId,
            amount,
            method,
            details.SenderPhoneNumber?.Trim(),
            details.TransactionId?.Trim()
        );

        var transaction = new PaymentTransaction(
            payment.Id,
            amount,
            method,
            PaymentStatus.Pending,
            details.TransactionId,
            details.Notes
        );

        payment.Transactions.Add(transaction);
        _dbContext.Payments.Add(payment);

        await _dbContext.SaveChangesAsync(ct);

        return new PaymentRecordDto(
            payment.Id,
            payment.OrderId,
            payment.Amount,
            payment.Method,
            payment.Status,
            payment.SenderPhoneNumber,
            payment.TransactionId,
            payment.AdminNotes,
            payment.VerifiedAtUtc,
            payment.CreatedAtUtc
        );
    }

    public async Task<PaymentVerificationResult> VerifyManualPaymentAsync(Guid paymentId, bool isVerified, string? adminNotes, CancellationToken ct = default)
    {
        var payment = await _dbContext.Payments.FirstOrDefaultAsync(p => p.Id == paymentId, ct);
        if (payment == null)
        {
            return new PaymentVerificationResult(false, PaymentStatus.Failed, "Payment record not found.");
        }

        // Anti-Replay Security Check: Ensure TrxID hasn't already been approved on another order
        if (isVerified && !string.IsNullOrWhiteSpace(payment.TransactionId))
        {
            var trimmedTrxId = payment.TransactionId.Trim();
            var isDuplicateTrxId = await _dbContext.Payments
                .AnyAsync(p => p.Id != payment.Id &&
                               p.TransactionId == trimmedTrxId &&
                               p.Status == PaymentStatus.Paid, ct);

            if (isDuplicateTrxId)
            {
                return new PaymentVerificationResult(
                    false,
                    PaymentStatus.Failed,
                    $"Transaction ID '{trimmedTrxId}' has already been verified and approved on another order.",
                    payment.OrderId
                );
            }
        }

        payment.Status = isVerified ? PaymentStatus.Paid : PaymentStatus.Failed;
        payment.AdminNotes = adminNotes;
        payment.VerifiedAtUtc = DateTimeOffset.UtcNow;
        payment.MarkUpdated();

        var transaction = new PaymentTransaction(
            payment.Id,
            payment.Amount,
            payment.Method,
            payment.Status,
            payment.TransactionId,
            adminNotes
        );

        _dbContext.PaymentTransactions.Add(transaction);
        await _dbContext.SaveChangesAsync(ct);

        return new PaymentVerificationResult(
            true,
            payment.Status,
            isVerified ? "Payment verified successfully." : "Payment marked as failed.",
            payment.OrderId
        );
    }

    public async Task<bool> MarkOrderPaymentAsPaidAsync(Guid orderId, string? notes = null, CancellationToken ct = default)
    {
        var payment = await _dbContext.Payments.FirstOrDefaultAsync(p => p.OrderId == orderId, ct);
        if (payment == null)
        {
            return false;
        }

        if (payment.Status == PaymentStatus.Paid)
        {
            return true;
        }

        payment.Status = PaymentStatus.Paid;
        payment.AdminNotes = notes ?? payment.AdminNotes;
        payment.VerifiedAtUtc = DateTimeOffset.UtcNow;
        payment.MarkUpdated();

        var transaction = new PaymentTransaction(
            payment.Id,
            payment.Amount,
            payment.Method,
            payment.Status,
            payment.TransactionId,
            notes ?? "Payment marked as paid."
        );

        _dbContext.PaymentTransactions.Add(transaction);
        await _dbContext.SaveChangesAsync(ct);
        return true;
    }

    public async Task<bool> MarkOrderPaymentAsFailedOrCancelledAsync(Guid orderId, string? reason = null, CancellationToken ct = default)
    {
        var payment = await _dbContext.Payments.FirstOrDefaultAsync(p => p.OrderId == orderId, ct);
        if (payment == null)
        {
            return false;
        }

        if (payment.Status == PaymentStatus.Paid)
        {
            // If already paid, mark as Refunded
            payment.Status = PaymentStatus.Refunded;
        }
        else
        {
            payment.Status = PaymentStatus.Failed;
        }

        payment.AdminNotes = reason ?? payment.AdminNotes;
        payment.MarkUpdated();

        var transaction = new PaymentTransaction(
            payment.Id,
            payment.Amount,
            payment.Method,
            payment.Status,
            payment.TransactionId,
            reason ?? "Payment cancelled."
        );

        _dbContext.PaymentTransactions.Add(transaction);
        await _dbContext.SaveChangesAsync(ct);
        return true;
    }

    public async Task<PaymentRecordDto?> GetPaymentByOrderIdAsync(Guid orderId, CancellationToken ct = default)
    {
        var payment = await _dbContext.Payments
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.OrderId == orderId, ct);

        if (payment == null)
        {
            return null;
        }

        return new PaymentRecordDto(
            payment.Id,
            payment.OrderId,
            payment.Amount,
            payment.Method,
            payment.Status,
            payment.SenderPhoneNumber,
            payment.TransactionId,
            payment.AdminNotes,
            payment.VerifiedAtUtc,
            payment.CreatedAtUtc
        );
    }
}
