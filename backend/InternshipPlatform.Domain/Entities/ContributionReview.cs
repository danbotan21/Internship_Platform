namespace InternshipPlatform.Domain.Entities;

// One mentor review per submitted revision: changes requested, validated or rejected.
public class ContributionReview
{
    public Guid Id { get; set; }

    public Guid ContributionRevisionId { get; set; }

    public Guid MentorId { get; set; }

    public ContributionReviewOutcome Outcome { get; set; }

    public string Summary { get; set; } = string.Empty;

    public ContributionRejectionReason? RejectionReason { get; set; }

    public DateTimeOffset ReviewedAtUtc { get; set; }

    public ContributionRevision ContributionRevision { get; set; } = null!;

    public ICollection<ContributionReviewCheck> Checks { get; set; } =
        new List<ContributionReviewCheck>();

    public ICollection<ContributionFeedbackItem> FeedbackItems { get; set; } =
        new List<ContributionFeedbackItem>();
}
