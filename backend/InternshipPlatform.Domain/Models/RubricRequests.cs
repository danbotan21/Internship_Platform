using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace InternshipPlatform.Domain.Models;

public enum RubricDraftSource
{
    // Copy the criteria of the currently published version.
    [JsonStringEnumMemberName("published")]
    Published = 1,

    // Start from the recommended internship criteria.
    [JsonStringEnumMemberName("template")]
    Template = 2,

    [JsonStringEnumMemberName("empty")]
    Empty = 3
}

public sealed class CreateRubricDraftRequest
{
    public RubricDraftSource Source { get; set; } = RubricDraftSource.Published;
}

public sealed class UpdateRubricDraftRequest
{
    [MaxLength(120)]
    public string Title { get; set; } = string.Empty;

    [MaxLength(500)]
    public string? ChangeNote { get; set; }
}

// Moves a draft criterion one place up (-1) or down (+1).
public sealed class MoveRubricCriterionRequest
{
    public int Offset { get; set; }
}

public sealed class SaveRubricCriterionRequest
{
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(500)]
    public string Description { get; set; } = string.Empty;

    [MaxLength(1000)]
    public string Guidance { get; set; } = string.Empty;

    public int Weight { get; set; }

    public int ScaleMax { get; set; } = 5;

    public decimal RatingStep { get; set; } = 0.5m;

    public bool IsVisibleToStudents { get; set; } = true;
}
