using InternshipPlatform.Domain.Entities;
using System.ComponentModel.DataAnnotations;

namespace InternshipPlatform.Domain.Models;

public sealed class CreateEvaluationRequest
{
    public Guid StudentId { get; set; }

    public EvaluationType Type { get; set; }

    public DateOnly PeriodStart { get; set; }

    public DateOnly PeriodEnd { get; set; }
}

// Saves the draft: ratings, criterion comments and structured feedback.
public sealed class SaveEvaluationRequest
{
    // Optional: correct the evaluation period while the evaluation is a draft.
    public DateOnly? PeriodStart { get; set; }

    public DateOnly? PeriodEnd { get; set; }

    public List<EvaluationScoreInput> Scores { get; set; } = [];

    [MaxLength(2000)]
    public string? Strengths { get; set; }

    [MaxLength(2000)]
    public string? AreasForImprovement { get; set; }

    [MaxLength(2000)]
    public string? NextSteps { get; set; }

    [MaxLength(2000)]
    public string? OverallComment { get; set; }
}

public sealed class EvaluationScoreInput
{
    public Guid CriterionId { get; set; }

    public decimal? Rating { get; set; }

    [MaxLength(1000)]
    public string? Comment { get; set; }
}

public sealed class AcknowledgeEvaluationRequest
{
    [MaxLength(1000)]
    public string? Response { get; set; }
}
