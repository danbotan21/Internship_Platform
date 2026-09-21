using InternshipPlatform.Domain.Entities;

namespace InternshipPlatform.Domain.Models;

public sealed class ContributionDetailsDto
{
    public Guid Id { get; set; }

    public InternshipMemberDto Student { get; set; } = new();

    public ContributionStatus Status { get; set; }

    public int CurrentRevisionNumber { get; set; }

    public DateTimeOffset CreatedAtUtc { get; set; }

    public DateTimeOffset UpdatedAtUtc { get; set; }

    public DateTimeOffset? SubmittedAtUtc { get; set; }

    public ContributionRevisionDto CurrentRevision { get; set; } = new();

    public IReadOnlyCollection<ContributionCollaboratorDto> Collaborators { get; set; } =
        Array.Empty<ContributionCollaboratorDto>();

    // Newest first.
    public IReadOnlyCollection<ContributionReviewDto> Reviews { get; set; } =
        Array.Empty<ContributionReviewDto>();

    public IReadOnlyCollection<ContributionHistoryEventDto> History { get; set; } =
        Array.Empty<ContributionHistoryEventDto>();

    // Requirements for the next (re)submission; empty once the contribution is locked.
    public IReadOnlyCollection<SubmissionCheckDto> SubmissionChecks { get; set; } =
        Array.Empty<SubmissionCheckDto>();

    public RevisionComparisonDto? Comparison { get; set; }

    // Team members who authored GitHub evidence but are not listed as collaborators.
    public IReadOnlyCollection<InternshipMemberDto> SuggestedCollaborators { get; set; } =
        Array.Empty<InternshipMemberDto>();

    public int ChangeRequestsUsed { get; set; }

    public int ChangeRequestsLimit { get; set; }
}
