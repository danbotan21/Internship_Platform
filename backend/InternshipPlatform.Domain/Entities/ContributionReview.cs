namespace InternshipPlatform.Domain.Entities;

public class ContributionReview
{
    public Guid Id { get; set; }

    public Guid ContributionRevisionId { get; set; }

    public Guid MentorId { get; set; }

    public string Feedback { get; set; } = string.Empty;

    public DateTimeOffset ChangesRequestedAtUtc { get; set; }

    public ContributionRevision ContributionRevision { get; set; } = null!;
}
