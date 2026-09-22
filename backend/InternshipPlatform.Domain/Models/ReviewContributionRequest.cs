using InternshipPlatform.Domain.Entities;
using System.ComponentModel.DataAnnotations;

namespace InternshipPlatform.Domain.Models;

public sealed class ReviewContributionRequest
{
    public ContributionReviewOutcome Outcome { get; set; }

    [MaxLength(2000)]
    public string Summary { get; set; } = string.Empty;

    public ContributionRejectionReason? RejectionReason { get; set; }

    // One entry for every review criterion.
    public List<ReviewCheckInput> Checks { get; set; } = [];

    // Required when requesting changes.
    public List<FeedbackItemInput> FeedbackItems { get; set; } = [];
}

public sealed class ReviewCheckInput
{
    public ContributionReviewCriterion Criterion { get; set; }

    public bool IsMet { get; set; }

    [MaxLength(1000)]
    public string? Comment { get; set; }
}

public sealed class FeedbackItemInput
{
    [MaxLength(1000)]
    public string Message { get; set; } = string.Empty;

    public Guid? EvidenceId { get; set; }
}
