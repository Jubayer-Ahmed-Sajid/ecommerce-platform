using Ecommerce.Domain.Common;
using Ecommerce.Domain.Enums;

namespace Ecommerce.Modules.Payments.Domain;

public class PaymentTransaction : Entity<Guid>
{
    public Guid PaymentId { get; set; }
    public Payment Payment { get; set; } = null!;

    public decimal Amount { get; set; }
    public PaymentMethod Method { get; set; }
    public PaymentStatus Status { get; set; }

    public string? TransactionReference { get; set; }
    public string? PayloadJson { get; set; }

    public PaymentTransaction()
    {
        Id = Guid.NewGuid();
    }

    public PaymentTransaction(Guid paymentId, decimal amount, PaymentMethod method, PaymentStatus status, string? transactionReference = null, string? payloadJson = null)
        : this()
    {
        PaymentId = paymentId;
        Amount = amount;
        Method = method;
        Status = status;
        TransactionReference = transactionReference;
        PayloadJson = payloadJson;
    }
}
