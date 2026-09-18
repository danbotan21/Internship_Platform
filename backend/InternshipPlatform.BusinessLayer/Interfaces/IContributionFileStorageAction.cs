namespace InternshipPlatform.BusinessLayer.Interfaces;

public sealed record StoredContributionFile(string StoragePath);

public interface IContributionFileStorageAction
{
    Task<StoredContributionFile> SaveAsync(
        Stream content,
        string extension,
        CancellationToken ct = default);

    // Null when the file no longer exists.
    Stream? OpenRead(string storagePath);

    Task DeleteAsync(string storagePath, CancellationToken ct = default);
}
