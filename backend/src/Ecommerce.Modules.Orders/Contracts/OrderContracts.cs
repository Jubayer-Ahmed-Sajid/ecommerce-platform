using Ecommerce.Domain.Enums;
using Ecommerce.Modules.Catalog.Contracts;

namespace Ecommerce.Modules.Orders.Contracts;

public record OrderItemRequest(
    Guid VariantId,
    int Quantity
);

public record CreateOrderCommand(
    IReadOnlyList<OrderItemRequest> Items,
    string CustomerFullName,
    string CustomerPhone,
    string? CustomerEmail,
    string DeliveryAddress,
    string DeliveryCity,
    string DeliveryDivision,
    string? PostalCode,
    PaymentMethod PaymentMethod,
    string? SenderPhoneNumber = null,
    string? TransactionId = null,
    string? CustomerNotes = null
);

public record OrderResultDto(
    bool Success,
    string? OrderNumber,
    Guid? OrderId,
    decimal TotalAmount,
    string? ErrorMessage
);

public record OrderItemDto(
    Guid VariantId,
    string ProductName,
    string Sku,
    int Quantity,
    decimal UnitPrice,
    decimal LineTotal
);

public record OrderShippingAddressDto(
    string AddressLine,
    string City,
    string Division,
    string? PostalCode
);

public record PaymentSummaryDto(
    PaymentMethod Method,
    PaymentStatus Status,
    string? TransactionId
);

public record OrderDetailsDto(
    Guid Id,
    string OrderNumber,
    OrderStatus Status,
    decimal SubTotal,
    decimal ShippingFee,
    decimal TotalAmount,
    DateTimeOffset CreatedAt,
    IReadOnlyList<OrderItemDto> Items,
    OrderShippingAddressDto ShippingAddress,
    PaymentSummaryDto Payment,
    string CustomerFullName,
    string CustomerPhone,
    string? CustomerEmail = null,
    string? CustomerNotes = null
);

public record OrderSummaryDto(
    Guid Id,
    string OrderNumber,
    OrderStatus Status,
    decimal TotalAmount,
    DateTimeOffset CreatedAt,
    string CustomerFullName,
    string CustomerPhone,
    int TotalItems,
    PaymentMethod PaymentMethod,
    PaymentStatus PaymentStatus
);

public record OrderQueryParameters(
    OrderStatus? Status = null,
    string? SearchTerm = null,
    int Page = 1,
    int PageSize = 20
);

public record OrderStatusResult(
    bool Success,
    OrderStatus Status,
    string? Message
);
