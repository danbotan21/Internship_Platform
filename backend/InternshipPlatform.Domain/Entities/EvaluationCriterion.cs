namespace InternshipPlatform.Domain.Entities;

public class EvaluationCriterion
{
    public Guid Id { get; set; }

    public Guid RubricVersionId { get; set; }

    public int Position { get; set; }

    public string Name { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    // Student-facing description of what low / good / excellent looks like.
    public string Guidance { get; set; } = string.Empty;

    // Percentage of the 100-point result; all criteria of a version sum to 100.
    public int Weight { get; set; }

    // Ratings go from 1 to ScaleMax in steps of RatingStep.
    public int ScaleMax { get; set; } = 5;

    public decimal RatingStep { get; set; } = 0.5m;

    public bool IsVisibleToStudents { get; set; } = true;

    public EvaluationRubricVersion RubricVersion { get; set; } = null!;
}
