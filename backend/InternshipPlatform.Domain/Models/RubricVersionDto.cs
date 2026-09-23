using InternshipPlatform.Domain.Entities;

namespace InternshipPlatform.Domain.Models;

public sealed class RubricCriterionDto
{
    public Guid Id { get; set; }

    public int Position { get; set; }

    public string Name { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public string Guidance { get; set; } = string.Empty;

    public int Weight { get; set; }

    public int ScaleMax { get; set; }

    public decimal RatingStep { get; set; }

    public bool IsVisibleToStudents { get; set; }
}

public sealed class RubricVersionDto
{
    public Guid Id { get; set; }

    public int VersionNumber { get; set; }

    public string Title { get; set; } = string.Empty;

    public RubricVersionStatus Status { get; set; }

    public string? ChangeNote { get; set; }

    public DateTimeOffset CreatedAtUtc { get; set; }

    public DateTimeOffset UpdatedAtUtc { get; set; }

    public DateTimeOffset? PublishedAtUtc { get; set; }

    public DateTimeOffset? ArchivedAtUtc { get; set; }

    public int TotalWeight { get; set; }

    public int UsedByEvaluations { get; set; }

    public IReadOnlyCollection<RubricCriterionDto> Criteria { get; set; } =
        Array.Empty<RubricCriterionDto>();

    // Rules a draft must meet before it can be published.
    public IReadOnlyCollection<SubmissionCheckDto> PublishChecks { get; set; } =
        Array.Empty<SubmissionCheckDto>();
}

// The mentor's current rubric: the published version and the draft being edited.
public sealed class MentorRubricDto
{
    public RubricVersionDto? Published { get; set; }

    public RubricVersionDto? Draft { get; set; }
}

public sealed class RubricVersionSummaryDto
{
    public Guid Id { get; set; }

    public int VersionNumber { get; set; }

    public string Title { get; set; } = string.Empty;

    public RubricVersionStatus Status { get; set; }

    public string? ChangeNote { get; set; }

    public DateTimeOffset CreatedAtUtc { get; set; }

    public DateTimeOffset? PublishedAtUtc { get; set; }

    public DateTimeOffset? ArchivedAtUtc { get; set; }

    public int CriteriaCount { get; set; }

    public int TotalWeight { get; set; }

    public int UsedByEvaluations { get; set; }
}

// The published criteria a student will be evaluated on (student-visible only).
public sealed class StudentCriteriaDto
{
    public string? MentorName { get; set; }

    public int? RubricVersionNumber { get; set; }

    public string? RubricTitle { get; set; }

    public DateTimeOffset? PublishedAtUtc { get; set; }

    public IReadOnlyCollection<RubricCriterionDto> Criteria { get; set; } =
        Array.Empty<RubricCriterionDto>();
}
