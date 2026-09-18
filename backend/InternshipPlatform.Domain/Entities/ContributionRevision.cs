namespace InternshipPlatform.Domain.Entities;

public class ContributionRevision
{
    public Guid Id { get; set; }

    public Guid ContributionId { get; set; }

    public int RevisionNumber { get; set; }

    public string Title { get; set; } = string.Empty;

    public ContributionCategory Category { get; set; } =
        ContributionCategory.Development;

    // Nullable while the revision is a draft; required before submission.
    public DateOnly? WorkStartDate { get; set; }

    public DateOnly? WorkEndDate { get; set; }

    public string Description { get; set; } = string.Empty;

    public string OwnRole { get; set; } = string.Empty;

    // Internship tasks belong to another module; a GitHub issue of the team
    // repository is used as the verifiable task reference until then.
    public string? LinkedIssueRepository { get; set; }

    public int? LinkedIssueNumber { get; set; }

    public string? LinkedIssueTitle { get; set; }

    public string? LinkedIssueState { get; set; }

    public string? RevisionNote { get; set; }

    public DateTimeOffset CreatedAtUtc { get; set; }

    public DateTimeOffset UpdatedAtUtc { get; set; }

    public DateTimeOffset? SubmittedAtUtc { get; set; }

    public Contribution Contribution { get; set; } = null!;

    public ICollection<ContributionEvidence> Evidence { get; set; } =
        new List<ContributionEvidence>();

    public ICollection<ContributionReview> Reviews { get; set; } =
        new List<ContributionReview>();
}
