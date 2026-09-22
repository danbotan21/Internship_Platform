using InternshipPlatform.Domain.Entities;

namespace InternshipPlatform.Domain.Models;

public sealed class ContributionReviewDto
{
    public Guid Id { get; set; }

    public int RevisionNumber { get; set; }

    public Guid MentorId { get; set; }

    public string? MentorName { get; set; }

    public ContributionReviewOutcome Outcome { get; set; }

    public string Summary { get; set; } = string.Empty;

    public ContributionRejectionReason? RejectionReason { get; set; }

    public DateTimeOffset ReviewedAtUtc { get; set; }

    public IReadOnlyCollection<ContributionReviewCheckDto> Checks { get; set; } =
        Array.Empty<ContributionReviewCheckDto>();

    public IReadOnlyCollection<ContributionFeedbackItemDto> FeedbackItems { get; set; } =
        Array.Empty<ContributionFeedbackItemDto>();
}

public sealed class ContributionReviewCheckDto
{
    public ContributionReviewCriterion Criterion { get; set; }

    public bool IsMet { get; set; }

    public string? Comment { get; set; }
}

public sealed class ContributionFeedbackItemDto
{
    public Guid Id { get; set; }

    public int Position { get; set; }

    public string Message { get; set; } = string.Empty;

    public Guid? EvidenceId { get; set; }

    public string? EvidenceName { get; set; }

    public string? Response { get; set; }

    public DateTimeOffset? RespondedAtUtc { get; set; }
}
