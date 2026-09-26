using Ecommerce.Domain.Enums;

namespace Ecommerce.Api.Contracts;

public record LoginRequest(string Email, string Password);

public record RegisterUserRequest(string FullName, string Email, string Password, string? PhoneNumber);

public record UpdateOrderStatusRequest(OrderStatus NewStatus, string? Notes);

public record VerifyPaymentRequest(bool IsVerified, string? AdminNotes);

public record CancelOrderRequest(string PhoneNumber, string? Reason);
