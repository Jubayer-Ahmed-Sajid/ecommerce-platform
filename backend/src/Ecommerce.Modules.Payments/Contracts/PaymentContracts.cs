using Ecommerce.Domain.Enums;

namespace Ecommerce.Modules.Payments.Contracts;

public record PaymentRecordDto(
    Guid Id,
    Guid OrderId,
    decimal Amount,
    PaymentMethod Method,
    PaymentStatus Status,
    string? SenderPhoneNumber,
    string? TransactionId,
    string? AdminNotes,
    DateTimeOffset? VerifiedAtUtc,
    DateTimeOffset CreatedAt
);

public record PaymentDetails(
    string? SenderPhoneNumber = null,
    string? TransactionId = null,
    string? Notes = null
);

public record PaymentVerificationResult(
    bool Success,
    PaymentStatus Status,
    string? Message,
    Guid? OrderId = null
);
