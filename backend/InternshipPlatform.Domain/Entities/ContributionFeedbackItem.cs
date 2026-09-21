namespace InternshipPlatform.Domain.Entities;

// One concrete change requested by the mentor. The student answers it in the
// next revision before resubmitting.
public class ContributionFeedbackItem
{
    public Guid Id { get; set; }

    public Guid ContributionReviewId { get; set; }

    public int Position { get; set; }

    public string Message { get; set; } = string.Empty;

    // Evidence of the reviewed revision the feedback points at, if any.
    public Guid? EvidenceId { get; set; }

    public string? Response { get; set; }

    public DateTimeOffset? RespondedAtUtc { get; set; }

    public ContributionReview Review { get; set; } = null!;
}
