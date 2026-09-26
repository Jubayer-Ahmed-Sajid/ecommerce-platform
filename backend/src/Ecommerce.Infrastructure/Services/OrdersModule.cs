using Microsoft.EntityFrameworkCore;
using Ecommerce.Domain.Enums;
using Ecommerce.Infrastructure.Persistence;
using Ecommerce.Modules.Catalog;
using Ecommerce.Modules.Catalog.Contracts;
using Ecommerce.Modules.Customers;
using Ecommerce.Modules.Customers.Contracts;
using Ecommerce.Modules.Inventory;
using Ecommerce.Modules.Inventory.Contracts;
using Ecommerce.Modules.Orders;
using Ecommerce.Modules.Orders.Contracts;
using Ecommerce.Modules.Orders.Domain;
using Ecommerce.Modules.Payments;
using Ecommerce.Modules.Payments.Contracts;

namespace Ecommerce.Infrastructure.Services;

public class OrdersModule : IOrdersModule
{
    private readonly EcommerceDbContext _dbContext;
    private readonly ICatalogModule _catalogModule;
    private readonly IInventoryModule _inventoryModule;
    private readonly ICustomersModule _customersModule;
    private readonly IPaymentsModule _paymentsModule;

    public OrdersModule(
        EcommerceDbContext dbContext,
        ICatalogModule catalogModule,
        IInventoryModule inventoryModule,
        ICustomersModule customersModule,
        IPaymentsModule paymentsModule)
    {
        _dbContext = dbContext;
        _catalogModule = catalogModule;
        _inventoryModule = inventoryModule;
        _customersModule = customersModule;
        _paymentsModule = paymentsModule;
    }

    public async Task<OrderResultDto> CheckoutAsync(CreateOrderCommand command, CancellationToken ct = default)
    {
        if (command.Items.Count == 0)
        {
            return new OrderResultDto(false, null, null, 0, "Order must contain at least one item.");
        }

        // 1. Get or Create Customer Record
        var customer = await _customersModule.GetOrCreateCustomerAsync(
            new CustomerContactInfo(command.CustomerFullName, command.CustomerPhone, command.CustomerEmail),
            ct
        );

        // 2. Fetch Authoritative Variant Prices from Catalog
        var orderItems = new List<OrderItem>();
        decimal subTotal = 0;

        foreach (var itemReq in command.Items)
        {
            if (itemReq.Quantity <= 0)
            {
                return new OrderResultDto(false, null, null, 0, $"Invalid quantity '{itemReq.Quantity}'.");
            }

            var priceSnapshot = await _catalogModule.GetVariantPriceSnapshotAsync(itemReq.VariantId, ct);
            if (priceSnapshot == null)
            {
                return new OrderResultDto(false, null, null, 0, $"Product variant '{itemReq.VariantId}' was not found in catalog.");
            }

            var lineTotal = priceSnapshot.UnitPrice * itemReq.Quantity;
            subTotal += lineTotal;

            orderItems.Add(new OrderItem
            {
                VariantId = priceSnapshot.VariantId,
                ProductId = priceSnapshot.ProductId,
                ProductName = priceSnapshot.ProductName,
                VariantName = priceSnapshot.Sku,
                Sku = priceSnapshot.Sku,
                UnitPrice = priceSnapshot.UnitPrice,
                Quantity = itemReq.Quantity,
                LineTotal = lineTotal
            });
        }

        // 3. Authoritative Shipping Fee Calculation
        decimal shippingFee = 120.00m; // Default outside Dhaka
        var city = command.DeliveryCity.Trim().ToLowerInvariant();
        var division = command.DeliveryDivision.Trim().ToLowerInvariant();
        if (city.Contains("dhaka") || division.Contains("dhaka"))
        {
            shippingFee = 60.00m; // Inside Dhaka metro
        }

        // Free shipping for orders ৳2,000 or more
        if (subTotal >= 2000.00m)
        {
            shippingFee = 0.00m;
        }

        var totalAmount = subTotal + shippingFee;

        // 4. Generate Order Reference Number
        var today = DateTime.UtcNow.ToString("yyyyMMdd", System.Globalization.CultureInfo.InvariantCulture);
        var randomSuffix = Random.Shared.Next(1000, 9999);
        var orderNumber = $"ORD-{today}-{randomSuffix}";

        var order = new Order
        {
            OrderNumber = orderNumber,
            CustomerId = customer.Id,
            CustomerFullName = command.CustomerFullName.Trim(),
            CustomerPhone = command.CustomerPhone.Trim(),
            CustomerEmail = command.CustomerEmail?.Trim(),
            DeliveryAddress = command.DeliveryAddress.Trim(),
            DeliveryCity = command.DeliveryCity.Trim(),
            DeliveryDivision = command.DeliveryDivision.Trim(),
            PostalCode = command.PostalCode?.Trim(),
            PaymentMethod = command.PaymentMethod,
            SubTotal = subTotal,
            ShippingFee = shippingFee,
            TotalAmount = totalAmount,
            CustomerNotes = command.CustomerNotes?.Trim(),
            Status = OrderStatus.PendingPayment
        };

        foreach (var oi in orderItems)
        {
            oi.OrderId = order.Id;
            order.Items.Add(oi);
        }

        order.StatusHistory.Add(new OrderStatusHistory(
            order.Id,
            OrderStatus.PendingPayment,
            OrderStatus.PendingPayment,
            "Order created via storefront checkout."
        ));

        // 5. Transactional Consistency: Deduct Stock, Save Order, Create Payment Intent
        await using var transaction = await _dbContext.Database.BeginTransactionAsync(ct);
        try
        {
            // Stock deduction
            var deductionItems = orderItems.Select(i => new StockDeductionItem(i.VariantId, i.Quantity));
            var stockResult = await _inventoryModule.DeductStockAsync(order.Id, deductionItems, ct);
            if (!stockResult.Success)
            {
                await transaction.RollbackAsync(ct);
                return new OrderResultDto(false, null, null, 0, stockResult.ErrorMessage ?? "Stock reservation failed.");
            }

            _dbContext.Orders.Add(order);
            await _dbContext.SaveChangesAsync(ct);

            // Payment Intent
            await _paymentsModule.CreatePaymentIntentAsync(
                order.Id,
                totalAmount,
                command.PaymentMethod,
                new PaymentDetails(command.SenderPhoneNumber, command.TransactionId, command.CustomerNotes),
                ct
            );

            await transaction.CommitAsync(ct);

            return new OrderResultDto(true, order.OrderNumber, order.Id, totalAmount, null);
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync(ct);
            return new OrderResultDto(false, null, null, 0, $"Order placement failed: {ex.Message}");
        }
    }

    public async Task<OrderDetailsDto?> GetOrderByIdAsync(Guid orderId, CancellationToken ct = default)
    {
        var order = await _dbContext.Orders
            .AsNoTracking()
            .Include(o => o.Items)
            .FirstOrDefaultAsync(o => o.Id == orderId, ct);

        if (order == null)
        {
            return null;
        }

        var payment = await _paymentsModule.GetPaymentByOrderIdAsync(order.Id, ct);

        return MapToDetailsDto(order, payment);
    }

    public async Task<OrderDetailsDto?> GetOrderByOrderNumberAsync(string orderNumber, string phoneNumber, CancellationToken ct = default)
    {
        var normalizedPhone = phoneNumber.Trim();

        var order = await _dbContext.Orders
            .AsNoTracking()
            .Include(o => o.Items)
            .FirstOrDefaultAsync(o => o.OrderNumber == orderNumber && o.CustomerPhone == normalizedPhone, ct);

        if (order == null)
        {
            return null;
        }

        var payment = await _paymentsModule.GetPaymentByOrderIdAsync(order.Id, ct);

        return MapToDetailsDto(order, payment);
    }

    public async Task<OrderStatusResult> UpdateOrderStatusAsync(Guid orderId, OrderStatus newStatus, string? notes, CancellationToken ct = default)
    {
        var order = await _dbContext.Orders
            .Include(o => o.Items)
            .FirstOrDefaultAsync(o => o.Id == orderId, ct);

        if (order == null)
        {
            return new OrderStatusResult(false, OrderStatus.PendingPayment, "Order not found.");
        }

        var oldStatus = order.Status;

        // Invariant: Delivered orders cannot be cancelled
        if (oldStatus == OrderStatus.Delivered && newStatus == OrderStatus.Cancelled)
        {
            return new OrderStatusResult(false, oldStatus, "Delivered orders cannot be cancelled.");
        }

        // Invariant: Releasing stock and cancelling payment on order cancellation
        if (newStatus == OrderStatus.Cancelled && oldStatus != OrderStatus.Cancelled)
        {
            var releaseItems = order.Items.Select(i => new StockDeductionItem(i.VariantId, i.Quantity));
            await _inventoryModule.ReleaseStockAsync(order.Id, releaseItems, ct);
            await _paymentsModule.MarkOrderPaymentAsFailedOrCancelledAsync(order.Id, notes ?? "Order cancelled.", ct);
        }

        // Invariant: When COD order is delivered, payment automatically transitions to Paid
        if (newStatus == OrderStatus.Delivered && oldStatus != OrderStatus.Delivered && order.PaymentMethod == PaymentMethod.CashOnDelivery)
        {
            await _paymentsModule.MarkOrderPaymentAsPaidAsync(order.Id, "Cash collected by courier upon delivery.", ct);
        }

        order.Status = newStatus;
        order.MarkUpdated();

        _dbContext.OrderStatusHistories.Add(new OrderStatusHistory(order.Id, oldStatus, newStatus, notes));
        await _dbContext.SaveChangesAsync(ct);

        return new OrderStatusResult(true, newStatus, $"Order status updated to {newStatus}.");
    }

    public async Task<OrderStatusResult> CancelOrderAsCustomerAsync(string orderNumber, string phoneNumber, string? reason, CancellationToken ct = default)
    {
        var normalizedPhone = phoneNumber.Trim();

        var order = await _dbContext.Orders
            .FirstOrDefaultAsync(o => o.OrderNumber == orderNumber && o.CustomerPhone == normalizedPhone, ct);

        if (order == null)
        {
            return new OrderStatusResult(false, OrderStatus.PendingPayment, "Order not found or mobile number does not match.");
        }

        // Customer self-cancellation is strictly permitted only while in PendingPayment
        if (order.Status != OrderStatus.PendingPayment)
        {
            return new OrderStatusResult(
                false,
                order.Status,
                "Orders that are already processing or shipped cannot be cancelled online. Please contact merchant support."
            );
        }

        return await UpdateOrderStatusAsync(
            order.Id,
            OrderStatus.Cancelled,
            reason ?? "Cancelled by customer prior to merchant fulfillment.",
            ct
        );
    }

    public async Task<PagedResult<OrderSummaryDto>> ListOrdersAsync(OrderQueryParameters query, CancellationToken ct = default)
    {
        var dbQuery = _dbContext.Orders
            .AsNoTracking()
            .Include(o => o.Items)
            .AsQueryable();

        if (query.Status.HasValue)
        {
            dbQuery = dbQuery.Where(o => o.Status == query.Status.Value);
        }

        if (!string.IsNullOrWhiteSpace(query.SearchTerm))
        {
            var term = query.SearchTerm.Trim();
            dbQuery = dbQuery.Where(o => o.OrderNumber.Contains(term) ||
                                         o.CustomerFullName.Contains(term) ||
                                         o.CustomerPhone.Contains(term));
        }

        dbQuery = dbQuery.OrderByDescending(o => o.CreatedAtUtc);

        var totalCount = await dbQuery.CountAsync(ct);
        var page = Math.Max(1, query.Page);
        var pageSize = Math.Clamp(query.PageSize, 1, 100);

        var orders = await dbQuery
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(ct);

        var orderIds = orders.Select(o => o.Id).ToList();
        var payments = await _dbContext.Payments
            .AsNoTracking()
            .Where(p => orderIds.Contains(p.OrderId))
            .ToDictionaryAsync(p => p.OrderId, p => p.Status, ct);

        var items = orders.Select(o =>
        {
            payments.TryGetValue(o.Id, out var paymentStatus);
            return new OrderSummaryDto(
                o.Id,
                o.OrderNumber,
                o.Status,
                o.TotalAmount,
                o.CreatedAtUtc,
                o.CustomerFullName,
                o.CustomerPhone,
                o.Items.Sum(i => i.Quantity),
                o.PaymentMethod,
                paymentStatus
            );
        }).ToList();

        return new PagedResult<OrderSummaryDto>(items, totalCount, page, pageSize);
    }

    private static OrderDetailsDto MapToDetailsDto(Order order, PaymentRecordDto? payment)
    {
        return new OrderDetailsDto(
            order.Id,
            order.OrderNumber,
            order.Status,
            order.SubTotal,
            order.ShippingFee,
            order.TotalAmount,
            order.CreatedAtUtc,
            order.Items.Select(i => new OrderItemDto(
                i.VariantId,
                i.ProductName,
                i.Sku,
                i.Quantity,
                i.UnitPrice,
                i.LineTotal
            )).ToList(),
            new OrderShippingAddressDto(
                order.DeliveryAddress,
                order.DeliveryCity,
                order.DeliveryDivision,
                order.PostalCode
            ),
            new PaymentSummaryDto(
                order.PaymentMethod,
                payment?.Status ?? PaymentStatus.Pending,
                payment?.TransactionId
            ),
            order.CustomerFullName,
            order.CustomerPhone,
            order.CustomerEmail,
            order.CustomerNotes
        );
    }
}
