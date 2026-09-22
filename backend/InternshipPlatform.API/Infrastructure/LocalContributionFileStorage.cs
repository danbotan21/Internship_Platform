using InternshipPlatform.BusinessLayer.Interfaces;

namespace InternshipPlatform.API.Infrastructure;

// Evidence files live outside wwwroot so they are never served as static
// content; they are streamed through the authorized download endpoint.
public sealed class LocalContributionFileStorage : IContributionFileStorageAction
{
    private readonly string _storageRoot;
    private readonly string _legacyRoot;

    public LocalContributionFileStorage(IWebHostEnvironment environment)
    {
        _storageRoot = Path.Combine(environment.ContentRootPath, "App_Data", "contribution-files");

        // Files uploaded before the move were stored under wwwroot.
        var webRoot = string.IsNullOrWhiteSpace(environment.WebRootPath)
            ? Path.Combine(environment.ContentRootPath, "wwwroot")
            : environment.WebRootPath;
        _legacyRoot = Path.Combine(webRoot, "uploads", "contributions");
    }

    public async Task<StoredContributionFile> SaveAsync(
        Stream content,
        string extension,
        CancellationToken ct = default)
    {
        Directory.CreateDirectory(_storageRoot);

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

        return new StoredContributionFile(storedName);
    }

    public Stream? OpenRead(string storagePath)
    {
        var physicalPath = ResolveExistingPath(storagePath);
        return physicalPath is null
            ? null
            : new FileStream(physicalPath, FileMode.Open, FileAccess.Read, FileShare.Read, 81920, useAsync: true);
    }

    public Task DeleteAsync(string storagePath, CancellationToken ct = default)
    {
        var physicalPath = ResolveExistingPath(storagePath);
        if (physicalPath is not null)
        {
            File.Delete(physicalPath);
        }

        return Task.CompletedTask;
    }

    private string? ResolveExistingPath(string storagePath)
    {
        // Only the file name is trusted, never a client supplied directory.
        var storedName = Path.GetFileName(storagePath);
        if (string.IsNullOrWhiteSpace(storedName))
        {
            return null;
        }

        foreach (var root in new[] { _storageRoot, _legacyRoot })
        {
            var fullRoot = Path.GetFullPath(root).TrimEnd(Path.DirectorySeparatorChar) + Path.DirectorySeparatorChar;
            var physicalPath = Path.GetFullPath(Path.Combine(root, storedName));
            if (physicalPath.StartsWith(fullRoot, StringComparison.OrdinalIgnoreCase) &&
                File.Exists(physicalPath))
            {
                return physicalPath;
            }
        }

        return null;
    }
}
