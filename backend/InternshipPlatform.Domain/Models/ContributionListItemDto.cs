using InternshipPlatform.Domain.Entities;

namespace InternshipPlatform.Domain.Models;

public sealed class ContributionListItemDto
{
    public Guid Id { get; set; }

    public InternshipMemberDto Student { get; set; } = new();

    public string Title { get; set; } = string.Empty;

    public ContributionCategory Category { get; set; }

    public ContributionStatus Status { get; set; }

    public DateOnly? WorkStartDate { get; set; }

    public DateOnly? WorkEndDate { get; set; }

    public int CurrentRevisionNumber { get; set; }

    public DateTimeOffset UpdatedAtUtc { get; set; }

    public DateTimeOffset? SubmittedAtUtc { get; set; }

    public EvidenceSummaryDto Evidence { get; set; } = new();

    public int CollaboratorCount { get; set; }

    public int PendingCollaboratorCount { get; set; }

    public int DisputedCollaboratorCount { get; set; }

    // Evidence signals that need the mentor's attention.
    public int WarningCount { get; set; }

    public ContributionReviewOutcome? LatestOutcome { get; set; }

    // Set when the list is "contributions I am attributed to".
    public Guid? MyCollaboratorId { get; set; }

    public ContributionCollaboratorStatus? MyCollaboratorStatus { get; set; }
}

public sealed class EvidenceSummaryDto
{
    public int Commits { get; set; }

    public int PullRequests { get; set; }

    public int Images { get; set; }

    public int Documents { get; set; }

    public int Links { get; set; }

    public int Additions { get; set; }

    public int Deletions { get; set; }
}
