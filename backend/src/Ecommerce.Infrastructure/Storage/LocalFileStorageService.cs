namespace Ecommerce.Infrastructure.Storage;

public class LocalFileStorageService : IFileStorageService
{
    private readonly string _uploadDirectory;
    private readonly string _baseUrl;

    public LocalFileStorageService(string uploadDirectory, string baseUrl = "/uploads")
    {
        _uploadDirectory = uploadDirectory;
        _baseUrl = baseUrl.TrimEnd('/');

        if (!Directory.Exists(_uploadDirectory))
        {
            Directory.CreateDirectory(_uploadDirectory);
        }
    }

    public async Task<string> SaveFileAsync(Stream fileStream, string fileName, string contentType, CancellationToken ct = default)
    {
        var extension = Path.GetExtension(fileName).ToLowerInvariant();
        var safeFileName = $"{Guid.NewGuid():N}{extension}";
        var destinationPath = Path.Combine(_uploadDirectory, safeFileName);

        await using var outputStream = new FileStream(destinationPath, FileMode.Create, FileAccess.Write);
        await fileStream.CopyToAsync(outputStream, ct);

        return $"{_baseUrl}/{safeFileName}";
    }

    public Task DeleteFileAsync(string fileUrl, CancellationToken ct = default)
    {
        var fileName = Path.GetFileName(fileUrl);
        var fullPath = Path.GetFullPath(Path.Combine(_uploadDirectory, fileName));
        var uploadDirFullPath = Path.GetFullPath(_uploadDirectory);

        // Path traversal guard
        if (!fullPath.StartsWith(uploadDirFullPath, StringComparison.OrdinalIgnoreCase))
        {
            throw new InvalidOperationException("Invalid file path: path traversal detected.");
        }

        if (File.Exists(fullPath))
        {
            File.Delete(fullPath);
        }

        return Task.CompletedTask;
    }
}
