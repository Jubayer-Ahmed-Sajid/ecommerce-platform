using Ecommerce.Domain.Common;
using Ecommerce.Domain.Enums;

namespace Ecommerce.Modules.Orders.Domain;

public class OrderStatusHistory : Entity<Guid>
{
    public Guid OrderId { get; set; }
    public Order Order { get; set; } = null!;

    public OrderStatus OldStatus { get; set; }
    public OrderStatus NewStatus { get; set; }
    public string? Notes { get; set; }

    public OrderStatusHistory()
    {
        Id = Guid.NewGuid();
    }

    public OrderStatusHistory(Guid orderId, OrderStatus oldStatus, OrderStatus newStatus, string? notes = null)
        : this()
    {
        OrderId = orderId;
        OldStatus = oldStatus;
        NewStatus = newStatus;
        Notes = notes;
    }
}
