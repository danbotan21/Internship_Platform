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
            .Include(item => item.Collaborators)
            .Include(item => item.Revisions)
                .ThenInclude(revision => revision.Evidence)
            .Include(item => item.Revisions)
                .ThenInclude(revision => revision.Reviews)
                    .ThenInclude(review => review.Checks)
            .Include(item => item.Revisions)
                .ThenInclude(revision => revision.Reviews)
                    .ThenInclude(review => review.FeedbackItems)
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

    private static bool IsEditable(ContributionStatus status) =>
        status is ContributionStatus.Draft or ContributionStatus.ChangesRequested;

    private static bool IsClosed(ContributionStatus status) =>
        status is ContributionStatus.Validated or ContributionStatus.Rejected;

    private static ContributionRevision GetCurrentRevision(Contribution contribution) =>
        contribution.Revisions.Single(revision =>
            revision.RevisionNumber == contribution.CurrentRevisionNumber);

    private static ContributionRevision? GetPreviousSubmittedRevision(Contribution contribution) =>
        contribution.Revisions
            .Where(revision =>
                revision.RevisionNumber < contribution.CurrentRevisionNumber &&
                revision.SubmittedAtUtc != null)
            .OrderByDescending(revision => revision.RevisionNumber)
            .FirstOrDefault();

    // Latest "changes requested" review, whose feedback the student must answer.
    private static ContributionReview? GetOpenChangeRequest(Contribution contribution) =>
        contribution.Status == ContributionStatus.ChangesRequested
            ? contribution.Revisions
                .SelectMany(revision => revision.Reviews)
                .Where(review => review.Outcome == ContributionReviewOutcome.ChangesRequested)
                .OrderByDescending(review => review.ReviewedAtUtc)
                .FirstOrDefault()
            : null;

    // Once a revision is submitted it is frozen; editing starts a new revision
    // that copies the previous content and evidence.
    private (ContributionRevision Revision, Guid? ClonedEvidenceId)
        EnsureEditableRevision(
            Contribution contribution,
            DateTimeOffset now,
            Guid? sourceEvidenceId = null,
            bool forceNew = false)
    {
        var current = GetCurrentRevision(contribution);
        if (current.SubmittedAtUtc is null && !forceNew)
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
            WorkStartDate = current.WorkStartDate,
            WorkEndDate = current.WorkEndDate,
            Description = current.Description,
            OwnRole = current.OwnRole,
            LinkedIssueRepository = current.LinkedIssueRepository,
            LinkedIssueNumber = current.LinkedIssueNumber,
            LinkedIssueTitle = current.LinkedIssueTitle,
            LinkedIssueState = current.LinkedIssueState,
            CreatedAtUtc = now,
            UpdatedAtUtc = now
        };

        foreach (var evidence in current.Evidence)
        {
            var clone = CloneEvidence(evidence, now);
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

    private static ContributionEvidence CloneEvidence(
        ContributionEvidence evidence,
        DateTimeOffset now) =>
        new()
        {
            Id = Guid.NewGuid(),
            Type = evidence.Type,
            Name = evidence.Name,
            Caption = evidence.Caption,
            ExternalUrl = evidence.ExternalUrl,
            StoragePath = evidence.StoragePath,
            OriginalFileName = evidence.OriginalFileName,
            ContentType = evidence.ContentType,
            FileSizeBytes = evidence.FileSizeBytes,
            GitHubRepository = evidence.GitHubRepository,
            GitHubReference = evidence.GitHubReference,
            GitHubAuthorLogin = evidence.GitHubAuthorLogin,
            GitHubAuthoredAtUtc = evidence.GitHubAuthoredAtUtc,
            GitHubAdditions = evidence.GitHubAdditions,
            GitHubDeletions = evidence.GitHubDeletions,
            GitHubChangedFiles = evidence.GitHubChangedFiles,
            GitHubState = evidence.GitHubState,
            GitHubChecksConclusion = evidence.GitHubChecksConclusion,
            GitHubDetailsJson = evidence.GitHubDetailsJson,
            CreatedAtUtc = now
        };

    // ---- Directory helpers --------------------------------------------------
    private async Task<Dictionary<Guid, InternshipMemberDto>> LoadMembersAsync(CancellationToken ct)
    {
        var members = await Directory.GetMembersAsync(ct);
        return members.ToDictionary(member => member.UserId);
    }

    private async Task<InternshipMemberDto?> FindMemberWithRoleAsync(
        Guid userId,
        InternshipMemberRole role,
        CancellationToken ct)
    {
        if (userId == Guid.Empty)
        {
            return null;
        }

        var member = await Directory.FindMemberAsync(userId, ct);
        return member?.Role == role ? member : null;
    }

    private static InternshipMemberDto MemberOrUnknown(
        IReadOnlyDictionary<Guid, InternshipMemberDto> members,
        Guid userId) =>
        members.TryGetValue(userId, out var member)
            ? member
            : new InternshipMemberDto
            {
                UserId = userId,
                FullName = "Unknown member",
                Role = InternshipMemberRole.Student
            };

    // ---- Result helpers -----------------------------------------------------
    private static string? TrimOrNull(string? value) =>
        string.IsNullOrWhiteSpace(value) ? null : value.Trim();

    private static ServiceResult<ContributionDetailsDto> Success(
        ContributionDetailsDto data) =>
        ServiceResult<ContributionDetailsDto>.Success(data);

    private static ServiceResult<ContributionDetailsDto> Failure(
        string error,
        ServiceErrorType errorType) =>
        ServiceResult<ContributionDetailsDto>.Fail(error, errorType);

    private static ServiceResult<T> Fail<T>(string error, ServiceErrorType errorType) =>
        ServiceResult<T>.Fail(error, errorType);

    private const string StudentRequired =
        "Only a student of the internship can manage their contributions.";

    private const string MentorRequired =
        "Only a mentor can review contributions.";

    private async Task<ServiceResult<ContributionDetailsDto>> DetailsAsync(
        Contribution contribution,
        CancellationToken ct) =>
        Success(MapDetails(contribution, await LoadMembersAsync(ct)));
}
