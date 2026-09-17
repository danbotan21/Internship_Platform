using InternshipPlatform.BusinessLayer.Interfaces;

namespace InternshipPlatform.API.Infrastructure;

public sealed class LocalContributionFileStorage : IContributionFileStorageAction
{
    private readonly string _storageRoot;

    public LocalContributionFileStorage(IWebHostEnvironment environment)
    {
        var webRoot = string.IsNullOrWhiteSpace(environment.WebRootPath)
            ? Path.Combine(environment.ContentRootPath, "wwwroot")
            : environment.WebRootPath;
        _storageRoot = Path.Combine(webRoot, "uploads", "contributions");
    }

    public async Task<StoredContributionFile> SaveAsync(
        Stream content,
        string originalFileName,
        CancellationToken ct = default)
    {
        Directory.CreateDirectory(_storageRoot);

        var extension = Path.GetExtension(Path.GetFileName(originalFileName));
        if (extension.Length > 16 || extension.Any(character =>
                !char.IsLetterOrDigit(character) && character != '.'))
        {
            extension = string.Empty;
        }

        var storedName = $"{Guid.NewGuid():N}{extension.ToLowerInvariant()}";
        var physicalPath = Path.Combine(_storageRoot, storedName);

        try
        {
            await using var output = new FileStream(
                physicalPath,
                FileMode.CreateNew,
                FileAccess.Write,
                FileShare.None,
                bufferSize: 81920,
                useAsync: true);
            await content.CopyToAsync(output, ct);
        }
        catch
        {
            if (File.Exists(physicalPath))
            {
                File.Delete(physicalPath);
            }

            throw;
        }

        return new StoredContributionFile($"/uploads/contributions/{storedName}");
    }

    public Task DeleteAsync(string storagePath, CancellationToken ct = default)
    {
        var storedName = Path.GetFileName(storagePath);
        if (string.IsNullOrWhiteSpace(storedName))
        {
            return Task.CompletedTask;
        }

        var root = Path.GetFullPath(_storageRoot)
            .TrimEnd(Path.DirectorySeparatorChar) + Path.DirectorySeparatorChar;
        var physicalPath = Path.GetFullPath(Path.Combine(_storageRoot, storedName));
        if (physicalPath.StartsWith(root, StringComparison.OrdinalIgnoreCase) &&
            File.Exists(physicalPath))
        {
            File.Delete(physicalPath);
        }

        return Task.CompletedTask;
    }
}
