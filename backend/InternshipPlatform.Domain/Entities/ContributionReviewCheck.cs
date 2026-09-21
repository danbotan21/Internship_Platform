namespace InternshipPlatform.Domain.Entities;

// The mentor's verdict on one review criterion.
public class ContributionReviewCheck
{
    public Guid Id { get; set; }

    public Guid ContributionReviewId { get; set; }

    public ContributionReviewCriterion Criterion { get; set; }

    public bool IsMet { get; set; }

    public string? Comment { get; set; }

    public ContributionReview Review { get; set; } = null!;
}
