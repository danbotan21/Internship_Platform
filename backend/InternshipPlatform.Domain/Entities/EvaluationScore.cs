namespace InternshipPlatform.Domain.Entities;

// The mentor's rating and comment for one criterion of an evaluation.
public class EvaluationScore
{
    public Guid Id { get; set; }

    public Guid EvaluationId { get; set; }

    public Guid CriterionId { get; set; }

    public decimal? Rating { get; set; }

    public string? Comment { get; set; }

    public DateTimeOffset UpdatedAtUtc { get; set; }

    public Evaluation Evaluation { get; set; } = null!;

    public EvaluationCriterion Criterion { get; set; } = null!;
}
