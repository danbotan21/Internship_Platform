namespace InternshipPlatform.BusinessLayer.Interfaces;

public sealed record StoredContributionFile(string StoragePath);

public interface IContributionFileStorageAction
{
    Task<StoredContributionFile> SaveAsync(
        Stream content,
        string originalFileName,
        CancellationToken ct = default);

    Task DeleteAsync(string storagePath, CancellationToken ct = default);
}
