using InternshipPlatform.BusinessLayer.Interfaces;
using InternshipPlatform.Domain.Entities;
using InternshipPlatform.Domain.Models;
using Microsoft.EntityFrameworkCore;

namespace InternshipPlatform.BusinessLayer.Core;

public partial class ContributionActions
{
    private const long MaximumFileSizeBytes = 1024 * 1024;

    internal async Task<ServiceResult<ContributionDetailsDto>> AddLinkEvidenceExecution(
        Guid contributionId,
        AddContributionLinkRequest request,
        Guid studentId,
        CancellationToken ct)
    {
        if (!IsHttpUrl(request.Url))
        {
            return Failure("Evidence must use a valid HTTP or HTTPS URL.", ServiceErrorType.Validation);
        }

        var contribution = await FindOwnedContributionAsync(contributionId, studentId, ct);
        if (contribution is null)
        {
            return Failure("Contribution not found.", ServiceErrorType.NotFound);
        }

        if (!IsEditable(contribution.Status))
        {
            return Failure(
                "Evidence cannot be changed while the contribution is in mentor review.",
                ServiceErrorType.Conflict);
        }

        var now = DateTimeOffset.UtcNow;
        var (revision, _) = EnsureEditableRevision(contribution, now);
        var evidence = new ContributionEvidence
        {
            Id = Guid.NewGuid(),
            Type = EvidenceType.Link,
            Name = request.Name.Trim(),
            ExternalUrl = request.Url.Trim(),
            CreatedAtUtc = now
        };
        revision.Evidence.Add(evidence);
        Context.ContributionEvidence.Add(evidence);
        revision.UpdatedAtUtc = now;
        contribution.UpdatedAtUtc = now;

        await Context.SaveChangesAsync(ct);
        return Success(MapDetails(contribution));
    }

    internal async Task<ServiceResult<ContributionDetailsDto>> AddFileEvidenceExecution(
        Guid contributionId,
        Guid studentId,
        string evidenceName,
        string originalFileName,
        string contentType,
        long fileSizeBytes,
        Stream content,
        CancellationToken ct)
    {
        if (fileSizeBytes <= 0 || fileSizeBytes > MaximumFileSizeBytes)
        {
            return Failure("The evidence file must be between 1 byte and 1 MB.", ServiceErrorType.Validation);
        }

        if (string.IsNullOrWhiteSpace(originalFileName))
        {
            return Failure("The evidence file must have a name.", ServiceErrorType.Validation);
        }

        var normalizedName = string.IsNullOrWhiteSpace(evidenceName)
            ? Path.GetFileName(originalFileName)
            : evidenceName.Trim();
        if (normalizedName.Length > 200)
        {
            return Failure("The evidence name cannot exceed 200 characters.", ServiceErrorType.Validation);
        }

        var contribution = await FindOwnedContributionAsync(contributionId, studentId, ct);
        if (contribution is null)
        {
            return Failure("Contribution not found.", ServiceErrorType.NotFound);
        }

        if (!IsEditable(contribution.Status))
        {
            return Failure(
                "Evidence cannot be changed while the contribution is in mentor review.",
                ServiceErrorType.Conflict);
        }

        StoredContributionFile storedFile;
        try
        {
            storedFile = await FileStorage.SaveAsync(content, originalFileName, ct);
        }
        catch (IOException)
        {
            return Failure("The evidence file could not be stored.", ServiceErrorType.Unexpected);
        }

        var now = DateTimeOffset.UtcNow;
        var (revision, _) = EnsureEditableRevision(contribution, now);
        var evidence = new ContributionEvidence
        {
            Id = Guid.NewGuid(),
            Type = EvidenceType.File,
            Name = normalizedName,
            StoragePath = storedFile.StoragePath,
            OriginalFileName = Path.GetFileName(originalFileName),
            ContentType = string.IsNullOrWhiteSpace(contentType)
                ? "application/octet-stream"
                : contentType,
            FileSizeBytes = fileSizeBytes,
            CreatedAtUtc = now
        };
        revision.Evidence.Add(evidence);
        Context.ContributionEvidence.Add(evidence);
        revision.UpdatedAtUtc = now;
        contribution.UpdatedAtUtc = now;

        try
        {
            await Context.SaveChangesAsync(ct);
        }
        catch
        {
            await FileStorage.DeleteAsync(storedFile.StoragePath, CancellationToken.None);
            throw;
        }

        return Success(MapDetails(contribution));
    }

    internal async Task<ServiceResult<ContributionDetailsDto>> RemoveEvidenceExecution(
        Guid contributionId,
        Guid evidenceId,
        Guid studentId,
        CancellationToken ct)
    {
        var contribution = await FindOwnedContributionAsync(contributionId, studentId, ct);
        if (contribution is null)
        {
            return Failure("Contribution not found.", ServiceErrorType.NotFound);
        }

        if (!IsEditable(contribution.Status))
        {
            return Failure(
                "Evidence cannot be changed while the contribution is in mentor review.",
                ServiceErrorType.Conflict);
        }

        var now = DateTimeOffset.UtcNow;
        var (revision, clonedEvidenceId) =
            EnsureEditableRevision(contribution, now, evidenceId);
        var effectiveEvidenceId = clonedEvidenceId ?? evidenceId;
        var evidence = revision.Evidence.FirstOrDefault(item => item.Id == effectiveEvidenceId);
        if (evidence is null)
        {
            return Failure("Evidence not found.", ServiceErrorType.NotFound);
        }

        var storagePath = evidence.StoragePath;
        revision.Evidence.Remove(evidence);
        revision.UpdatedAtUtc = now;
        contribution.UpdatedAtUtc = now;
        await Context.SaveChangesAsync(ct);

        if (!string.IsNullOrWhiteSpace(storagePath))
        {
            var stillReferenced = await Context.ContributionEvidence
                .AsNoTracking()
                .AnyAsync(item => item.StoragePath == storagePath, ct);
            if (!stillReferenced)
            {
                await FileStorage.DeleteAsync(storagePath, ct);
            }
        }

        return Success(MapDetails(contribution));
    }

    private static bool IsHttpUrl(string value) =>
        Uri.TryCreate(value.Trim(), UriKind.Absolute, out var uri) &&
        (uri.Scheme == Uri.UriSchemeHttp || uri.Scheme == Uri.UriSchemeHttps);
}
