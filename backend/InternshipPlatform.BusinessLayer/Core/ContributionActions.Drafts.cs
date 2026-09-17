using InternshipPlatform.Domain.Entities;
using InternshipPlatform.Domain.Models;
using Microsoft.EntityFrameworkCore;

namespace InternshipPlatform.BusinessLayer.Core;

public partial class ContributionActions
{
    internal async Task<ServiceResult<ContributionDetailsDto>> CreateDraftExecution(
        SaveContributionDraftRequest request,
        Guid studentId,
        CancellationToken ct)
    {
        if (studentId == Guid.Empty)
        {
            return Failure("A student identifier is required.", ServiceErrorType.Validation);
        }

        var now = DateTimeOffset.UtcNow;
        var contribution = new Contribution
        {
            Id = Guid.NewGuid(),
            StudentId = studentId,
            Status = ContributionStatus.Draft,
            CurrentRevisionNumber = 1,
            CreatedAtUtc = now,
            UpdatedAtUtc = now
        };

        contribution.Revisions.Add(new ContributionRevision
        {
            Id = Guid.NewGuid(),
            RevisionNumber = 1,
            Title = request.Title.Trim(),
            Category = request.Category,
            WorkPeriod = request.WorkPeriod.Trim(),
            Description = request.Description.Trim(),
            OwnRole = request.OwnRole.Trim(),
            LinkedTaskReference = TrimOrNull(request.LinkedTaskReference),
            EvidenceNote = TrimOrNull(request.EvidenceNote),
            RevisionNote = TrimOrNull(request.RevisionNote),
            CreatedAtUtc = now,
            UpdatedAtUtc = now
        });

        Context.Contributions.Add(contribution);
        await Context.SaveChangesAsync(ct);

        return Success(MapDetails(contribution));
    }

    internal async Task<ServiceResult<ContributionDetailsDto>> UpdateDraftExecution(
        Guid contributionId,
        SaveContributionDraftRequest request,
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
                "A submitted contribution is read-only while it is in mentor review.",
                ServiceErrorType.Conflict);
        }

        var now = DateTimeOffset.UtcNow;
        var (revision, _) = EnsureEditableRevision(contribution, now);

        revision.Title = request.Title.Trim();
        revision.Category = request.Category;
        revision.WorkPeriod = request.WorkPeriod.Trim();
        revision.Description = request.Description.Trim();
        revision.OwnRole = request.OwnRole.Trim();
        revision.LinkedTaskReference = TrimOrNull(request.LinkedTaskReference);
        revision.EvidenceNote = TrimOrNull(request.EvidenceNote);
        revision.RevisionNote = TrimOrNull(request.RevisionNote);
        revision.UpdatedAtUtc = now;
        contribution.UpdatedAtUtc = now;

        await Context.SaveChangesAsync(ct);
        return Success(MapDetails(contribution));
    }

    internal async Task<IReadOnlyList<ContributionListItemDto>> GetStudentContributionsExecution(
        Guid studentId,
        string? search,
        ContributionStatus? status,
        ContributionCategory? category,
        CancellationToken ct)
    {
        var query = ContributionGraph(tracking: false)
            .Where(item => item.StudentId == studentId);

        query = ApplyListFilters(query, search, status, category);

        var contributions = await query
            .OrderByDescending(item => item.UpdatedAtUtc)
            .ToListAsync(ct);

        return contributions.Select(MapListItem).ToList();
    }

    internal async Task<ServiceResult<ContributionDetailsDto>> GetStudentContributionExecution(
        Guid contributionId,
        Guid studentId,
        CancellationToken ct)
    {
        var contribution = await ContributionGraph(tracking: false)
            .FirstOrDefaultAsync(
                item => item.Id == contributionId && item.StudentId == studentId,
                ct);

        return contribution is null
            ? Failure("Contribution not found.", ServiceErrorType.NotFound)
            : Success(MapDetails(contribution));
    }
}
