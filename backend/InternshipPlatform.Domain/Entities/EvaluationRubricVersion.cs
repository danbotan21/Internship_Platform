namespace InternshipPlatform.Domain.Entities;

// One version of a mentor's evaluation rubric. Published versions are
// immutable; editing always happens in a new draft version.
public class EvaluationRubricVersion
{
    public Guid Id { get; set; }

    // References the authenticated mentor who owns this rubric.
    public Guid MentorId { get; set; }

    public int VersionNumber { get; set; }

    public string Title { get; set; } = "Internship rubric";

    public RubricVersionStatus Status { get; set; } = RubricVersionStatus.Draft;

    // What changed compared to the previous version.
    public string? ChangeNote { get; set; }

    public DateTimeOffset CreatedAtUtc { get; set; }

    public DateTimeOffset UpdatedAtUtc { get; set; }

    public DateTimeOffset? PublishedAtUtc { get; set; }

    public DateTimeOffset? ArchivedAtUtc { get; set; }

    public ICollection<EvaluationCriterion> Criteria { get; set; } =
        new List<EvaluationCriterion>();
}
