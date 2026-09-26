using Ecommerce.Domain.Enums;
using Ecommerce.Modules.Payments.Contracts;

namespace Ecommerce.Modules.Payments;

public interface IPaymentsModule
{
    Task<PaymentRecordDto> CreatePaymentIntentAsync(Guid orderId, decimal amount, PaymentMethod method, PaymentDetails details, CancellationToken ct = default);
    Task<PaymentVerificationResult> VerifyManualPaymentAsync(Guid paymentId, bool isVerified, string? adminNotes, CancellationToken ct = default);
    Task<PaymentRecordDto?> GetPaymentByOrderIdAsync(Guid orderId, CancellationToken ct = default);
    Task<bool> MarkOrderPaymentAsPaidAsync(Guid orderId, string? notes = null, CancellationToken ct = default);
    Task<bool> MarkOrderPaymentAsFailedOrCancelledAsync(Guid orderId, string? reason = null, CancellationToken ct = default);
}
