using Ecommerce.Domain.Common;
using Ecommerce.Domain.Enums;

namespace Ecommerce.Modules.Payments.Domain;

public class Payment : Entity<Guid>
{
    public Guid OrderId { get; set; }
    public decimal Amount { get; set; }
    public PaymentMethod Method { get; set; }
    public PaymentStatus Status { get; set; } = PaymentStatus.Pending;

    public string? SenderPhoneNumber { get; set; }
    public string? TransactionId { get; set; }
    public string? AdminNotes { get; set; }
    public DateTimeOffset? VerifiedAtUtc { get; set; }

    public ICollection<PaymentTransaction> Transactions { get; set; } = new List<PaymentTransaction>();

    public Payment()
    {
        Id = Guid.NewGuid();
    }

    public Payment(Guid orderId, decimal amount, PaymentMethod method, string? senderPhoneNumber = null, string? transactionId = null)
        : this()
    {
        OrderId = orderId;
        Amount = amount;
        Method = method;
        SenderPhoneNumber = senderPhoneNumber;
        TransactionId = transactionId;
        Status = PaymentStatus.Pending;
    }
}
