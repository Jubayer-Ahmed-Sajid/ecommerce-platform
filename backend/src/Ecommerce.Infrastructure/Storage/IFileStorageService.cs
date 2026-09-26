namespace Ecommerce.Infrastructure.Storage;

public interface IFileStorageService
{
    Task<string> SaveFileAsync(Stream fileStream, string fileName, string contentType, CancellationToken ct = default);
    Task DeleteFileAsync(string fileUrl, CancellationToken ct = default);
}
