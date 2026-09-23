using InternshipPlatform.Domain.Entities;

namespace InternshipPlatform.Domain.Models;

public sealed class EvaluationListItemDto
{
    public Guid Id { get; set; }

    public InternshipMemberDto Student { get; set; } = new();

    public string? MentorName { get; set; }

    public EvaluationType Type { get; set; }

    public DateOnly PeriodStart { get; set; }

    public DateOnly PeriodEnd { get; set; }

    public EvaluationStatus Status { get; set; }

    public int RubricVersionNumber { get; set; }

    public int CriteriaScored { get; set; }

    public int CriteriaTotal { get; set; }

    // Hidden (null) for students until finalized.
    public decimal? FinalScore { get; set; }

    public DateTimeOffset UpdatedAtUtc { get; set; }

    public DateTimeOffset? FinalizedAtUtc { get; set; }

    public DateTimeOffset? AcknowledgedAtUtc { get; set; }

    // The evaluation period has not started yet.
    public bool IsUpcoming { get; set; }

    // Not finalized and the period ends within 7 days.
    public bool IsDueSoon { get; set; }

    // Not finalized and the period already ended.
    public bool IsOverdue { get; set; }
}

// One student of the mentor with their evaluation instances.
public sealed class StudentEvaluationOverviewDto
{
    public InternshipMemberDto Student { get; set; } = new();

    public IReadOnlyCollection<EvaluationListItemDto> Evaluations { get; set; } =
        Array.Empty<EvaluationListItemDto>();

    public IReadOnlyCollection<EvaluationType> MissingTypes { get; set; } =
        Array.Empty<EvaluationType>();

    public int ValidatedContributionCount { get; set; }

    public decimal? LatestFinalScore { get; set; }
}
