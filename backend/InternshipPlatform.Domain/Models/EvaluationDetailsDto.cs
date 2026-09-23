using InternshipPlatform.Domain.Entities;

namespace InternshipPlatform.Domain.Models;

public sealed class EvaluationCriterionScoreDto
{
    public Guid CriterionId { get; set; }

    public string Name { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public string Guidance { get; set; } = string.Empty;

    public int Weight { get; set; }

    public int ScaleMax { get; set; }

    public decimal RatingStep { get; set; }

    public decimal? Rating { get; set; }

    public string? Comment { get; set; }

    // rating / scale max x weight, once rated.
    public decimal? WeightedPoints { get; set; }

    // Rating of the same criterion in the student's previous finalized evaluation.
    public decimal? PreviousRating { get; set; }

    public int? PreviousScaleMax { get; set; }
}

public sealed class EvaluationFeedbackDto
{
    public string? Strengths { get; set; }

    public string? AreasForImprovement { get; set; }

    public string? NextSteps { get; set; }

    public string? OverallComment { get; set; }
}

public sealed class EvaluationDetailsDto
{
    public Guid Id { get; set; }

    public InternshipMemberDto Student { get; set; } = new();

    public InternshipMemberDto Mentor { get; set; } = new();

    public EvaluationType Type { get; set; }

    public DateOnly PeriodStart { get; set; }

    public DateOnly PeriodEnd { get; set; }

    public EvaluationStatus Status { get; set; }

    public Guid RubricVersionId { get; set; }

    public int RubricVersionNumber { get; set; }

    public string RubricTitle { get; set; } = string.Empty;

    // False for students until the evaluation is finalized: scores and feedback are hidden.
    public bool ResultsVisible { get; set; }

    public bool IsUpcoming { get; set; }

    public IReadOnlyCollection<EvaluationCriterionScoreDto> Criteria { get; set; } =
        Array.Empty<EvaluationCriterionScoreDto>();

    public EvaluationFeedbackDto Feedback { get; set; } = new();

    public int CriteriaScored { get; set; }

    public int CriteriaTotal { get; set; }

    // Weighted points earned by the rated criteria, out of their combined weight.
    public decimal ProvisionalPoints { get; set; }

    public int ProvisionalMaxPoints { get; set; }

    public decimal? FinalScore { get; set; }

    public decimal? PreviousFinalScore { get; set; }

    public EvaluationType? PreviousType { get; set; }

    // What must be complete before the evaluation can move to review / be finalized.
    public IReadOnlyCollection<SubmissionCheckDto> Checks { get; set; } =
        Array.Empty<SubmissionCheckDto>();

    public DateTimeOffset CreatedAtUtc { get; set; }

    public DateTimeOffset UpdatedAtUtc { get; set; }

    public DateTimeOffset? ReadyForReviewAtUtc { get; set; }

    public DateTimeOffset? FinalizedAtUtc { get; set; }

    public DateTimeOffset? AcknowledgedAtUtc { get; set; }

    public string? StudentResponse { get; set; }
}
