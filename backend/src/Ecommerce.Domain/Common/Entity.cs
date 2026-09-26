namespace Ecommerce.Domain.Common;

/// <summary>
/// Base class for domain entities with a strongly typed identifier and audit timestamps.
/// </summary>
public abstract class Entity<TId> where TId : notnull
{
    public TId Id { get; set; } = default!;

    public DateTimeOffset CreatedAtUtc { get; protected set; } = DateTimeOffset.UtcNow;

    public DateTimeOffset? UpdatedAtUtc { get; protected set; }

    public void MarkUpdated()
    {
        UpdatedAtUtc = DateTimeOffset.UtcNow;
    }
}
