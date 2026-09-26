using Ecommerce.Domain.Enums;
using Ecommerce.Modules.Catalog.Contracts;
using Ecommerce.Modules.Orders.Contracts;

namespace Ecommerce.Modules.Orders;

public interface IOrdersModule
{
    Task<OrderResultDto> CheckoutAsync(CreateOrderCommand command, CancellationToken ct = default);
    Task<OrderDetailsDto?> GetOrderByIdAsync(Guid orderId, CancellationToken ct = default);
    Task<OrderDetailsDto?> GetOrderByOrderNumberAsync(string orderNumber, string phoneNumber, CancellationToken ct = default);
    Task<OrderStatusResult> UpdateOrderStatusAsync(Guid orderId, OrderStatus newStatus, string? notes, CancellationToken ct = default);
    Task<OrderStatusResult> CancelOrderAsCustomerAsync(string orderNumber, string phoneNumber, string? reason, CancellationToken ct = default);
    Task<PagedResult<OrderSummaryDto>> ListOrdersAsync(OrderQueryParameters query, CancellationToken ct = default);
}
