namespace InternshipPlatform.Domain.Entities;

public class ContributionDecision
{
    public Guid Id { get; set; }

    public Guid ContributionRevisionId { get; set; }

    public Guid MentorId { get; set; }

    public ContributionDecisionType Decision { get; set; }

    public string? Reason { get; set; }

    public string? Note { get; set; }

    public DateTimeOffset DecidedAtUtc { get; set; }

    public ContributionRevision ContributionRevision { get; set; } = null!;
}
