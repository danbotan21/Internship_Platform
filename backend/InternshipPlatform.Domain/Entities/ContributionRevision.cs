namespace InternshipPlatform.Domain.Entities;

public class ContributionRevision
{
    public Guid Id { get; set; }

    public Guid ContributionId { get; set; }

    public int RevisionNumber { get; set; }

    public string Title { get; set; } = string.Empty;

    public ContributionCategory Category { get; set; } =
        ContributionCategory.Development;

    public string WorkPeriod { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public string OwnRole { get; set; } = string.Empty;

    // Kept as a reference because InternshipTask belongs to another module.
    public string? LinkedTaskReference { get; set; }

    public string? EvidenceNote { get; set; }

    public string? RevisionNote { get; set; }

    public DateTimeOffset CreatedAtUtc { get; set; }

    public DateTimeOffset UpdatedAtUtc { get; set; }

    public DateTimeOffset? SubmittedAtUtc { get; set; }

    public Contribution Contribution { get; set; } = null!;

    public ICollection<ContributionEvidence> Evidence { get; set; } =
        new List<ContributionEvidence>();

    public ICollection<ContributionReview> Reviews { get; set; } =
        new List<ContributionReview>();

    public ICollection<ContributionDecision> Decisions { get; set; } =
        new List<ContributionDecision>();
}
