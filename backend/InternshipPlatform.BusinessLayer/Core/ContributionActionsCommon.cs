using InternshipPlatform.Domain.Entities;
using InternshipPlatform.Domain.Models;
using Microsoft.EntityFrameworkCore;

namespace InternshipPlatform.BusinessLayer.Core;

public partial class ContributionActions
{
    private IQueryable<Contribution> ContributionGraph(bool tracking)
    {
        IQueryable<Contribution> query = Context.Contributions;
        if (!tracking)
        {
            query = query.AsNoTracking();
        }

        return query
            .Include(item => item.Revisions)
                .ThenInclude(revision => revision.Evidence)
            .Include(item => item.Revisions)
                .ThenInclude(revision => revision.Reviews)
            .AsSplitQuery();
    }

    private Task<Contribution?> FindOwnedContributionAsync(
        Guid contributionId,
        Guid studentId,
        CancellationToken ct) =>
        ContributionGraph(tracking: true)
            .FirstOrDefaultAsync(
                item => item.Id == contributionId && item.StudentId == studentId,
                ct);

    private static IQueryable<Contribution> ApplyListFilters(
        IQueryable<Contribution> query,
        string? search,
        ContributionStatus? status,
        ContributionCategory? category)
    {
        if (status.HasValue)
        {
            query = query.Where(item => item.Status == status.Value);
        }

        if (category.HasValue)
        {
            query = query.Where(item => item.Revisions.Any(revision =>
                revision.RevisionNumber == item.CurrentRevisionNumber &&
                revision.Category == category.Value));
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            var normalizedSearch = search.Trim().ToLower();
            query = query.Where(item => item.Revisions.Any(revision =>
                revision.RevisionNumber == item.CurrentRevisionNumber &&
                revision.Title.ToLower().Contains(normalizedSearch)));
        }

        return query;
    }

    private static bool IsEditable(ContributionStatus status) =>
        status is ContributionStatus.Draft or ContributionStatus.ChangesRequested;

    private static ContributionRevision GetCurrentRevision(Contribution contribution) =>
        contribution.Revisions.Single(revision =>
            revision.RevisionNumber == contribution.CurrentRevisionNumber);

    private (ContributionRevision Revision, Guid? ClonedEvidenceId)
        EnsureEditableRevision(
            Contribution contribution,
            DateTimeOffset now,
            Guid? sourceEvidenceId = null)
    {
        var current = GetCurrentRevision(contribution);
        if (current.SubmittedAtUtc is null)
        {
            return (current, sourceEvidenceId);
        }

        Guid? clonedEvidenceId = null;
        var next = new ContributionRevision
        {
            Id = Guid.NewGuid(),
            RevisionNumber = current.RevisionNumber + 1,
            Title = current.Title,
            Category = current.Category,
            WorkPeriod = current.WorkPeriod,
            Description = current.Description,
            OwnRole = current.OwnRole,
            LinkedTaskReference = current.LinkedTaskReference,
            EvidenceNote = current.EvidenceNote,
            CreatedAtUtc = now,
            UpdatedAtUtc = now
        };

        foreach (var evidence in current.Evidence)
        {
            var clone = new ContributionEvidence
            {
                Id = Guid.NewGuid(),
                Type = evidence.Type,
                Name = evidence.Name,
                ExternalUrl = evidence.ExternalUrl,
                StoragePath = evidence.StoragePath,
                OriginalFileName = evidence.OriginalFileName,
                ContentType = evidence.ContentType,
                FileSizeBytes = evidence.FileSizeBytes,
                CreatedAtUtc = now
            };
            next.Evidence.Add(clone);

            if (sourceEvidenceId == evidence.Id)
            {
                clonedEvidenceId = clone.Id;
            }
        }

        contribution.CurrentRevisionNumber = next.RevisionNumber;
        contribution.Revisions.Add(next);
        Context.ContributionRevisions.Add(next);
        return (next, clonedEvidenceId);
    }

    private static string? TrimOrNull(string? value) =>
        string.IsNullOrWhiteSpace(value) ? null : value.Trim();

    private static ServiceResult<ContributionDetailsDto> Success(
        ContributionDetailsDto data) =>
        ServiceResult<ContributionDetailsDto>.Success(data);

    private static ServiceResult<ContributionDetailsDto> Failure(
        string error,
        ServiceErrorType errorType) =>
        ServiceResult<ContributionDetailsDto>.Fail(error, errorType);
}
