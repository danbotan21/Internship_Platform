namespace InternshipPlatform.Domain.Entities;

// A mentor's period-based evaluation of one student's internship performance.
public class Evaluation
{
    public Guid Id { get; set; }

    // References the real student and mentor accounts.
    public Guid StudentId { get; set; }

    public Guid MentorId { get; set; }

    // Frozen at creation: later rubric versions never change this evaluation.
    public Guid RubricVersionId { get; set; }

    public EvaluationType Type { get; set; }

    public DateOnly PeriodStart { get; set; }

    public DateOnly PeriodEnd { get; set; }

    public EvaluationStatus Status { get; set; } = EvaluationStatus.Draft;

    public string? Strengths { get; set; }

    public string? AreasForImprovement { get; set; }

    public string? NextSteps { get; set; }

    public string? OverallComment { get; set; }

    // Stored when the evaluation is finalized.
    public decimal? FinalScore { get; set; }

    public DateTimeOffset CreatedAtUtc { get; set; }

    public DateTimeOffset UpdatedAtUtc { get; set; }

    public DateTimeOffset? ReadyForReviewAtUtc { get; set; }

    public DateTimeOffset? FinalizedAtUtc { get; set; }

    // The student confirms they read the finalized result.
    public DateTimeOffset? AcknowledgedAtUtc { get; set; }

    public string? StudentResponse { get; set; }

    public EvaluationRubricVersion RubricVersion { get; set; } = null!;

    public ICollection<EvaluationScore> Scores { get; set; } =
        new List<EvaluationScore>();
}
