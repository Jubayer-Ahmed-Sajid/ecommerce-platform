using Ecommerce.Domain.Common;
using Ecommerce.Domain.Enums;

namespace Ecommerce.Modules.Orders.Domain;

public class Order : Entity<Guid>
{
    public string OrderNumber { get; set; } = string.Empty;
    public Guid CustomerId { get; set; }
    public string CustomerFullName { get; set; } = string.Empty;
    public string CustomerPhone { get; set; } = string.Empty;
    public string? CustomerEmail { get; set; }

    public string DeliveryAddress { get; set; } = string.Empty;
    public string DeliveryCity { get; set; } = string.Empty;
    public string DeliveryDivision { get; set; } = string.Empty;
    public string? PostalCode { get; set; }

    public OrderStatus Status { get; set; } = OrderStatus.PendingPayment;
    public PaymentMethod PaymentMethod { get; set; } = PaymentMethod.CashOnDelivery;

    public decimal SubTotal { get; set; }
    public decimal ShippingFee { get; set; }
    public decimal TotalAmount { get; set; }

    public string? CustomerNotes { get; set; }

    public ICollection<OrderItem> Items { get; set; } = new List<OrderItem>();
    public ICollection<OrderStatusHistory> StatusHistory { get; set; } = new List<OrderStatusHistory>();

    public Order()
    {
        Id = Guid.NewGuid();
    }

    public Order(
        string orderNumber,
        Guid customerId,
        string customerFullName,
        string customerPhone,
        string deliveryAddress,
        string deliveryCity,
        string deliveryDivision,
        PaymentMethod paymentMethod,
        decimal subTotal,
        decimal shippingFee,
        string? customerEmail = null,
        string? postalCode = null,
        string? customerNotes = null)
        : this()
    {
        OrderNumber = orderNumber;
        CustomerId = customerId;
        CustomerFullName = customerFullName;
        CustomerPhone = customerPhone;
        CustomerEmail = customerEmail;
        DeliveryAddress = deliveryAddress;
        DeliveryCity = deliveryCity;
        DeliveryDivision = deliveryDivision;
        PostalCode = postalCode;
        PaymentMethod = paymentMethod;
        SubTotal = subTotal;
        ShippingFee = shippingFee;
        TotalAmount = subTotal + shippingFee;
        CustomerNotes = customerNotes;
        Status = OrderStatus.PendingPayment;
    }
}
