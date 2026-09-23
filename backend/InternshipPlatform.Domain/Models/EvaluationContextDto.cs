using InternshipPlatform.Domain.Entities;

namespace InternshipPlatform.Domain.Models;

// Read-only information the mentor may consult; it never calculates a rating.
public sealed class EvaluationContextDto
{
    public DateOnly PeriodStart { get; set; }

    public DateOnly PeriodEnd { get; set; }

    public IReadOnlyCollection<EvaluationContextContributionDto> Contributions { get; set; } =
        Array.Empty<EvaluationContextContributionDto>();

    public IReadOnlyCollection<EvaluationListItemDto> PreviousEvaluations { get; set; } =
        Array.Empty<EvaluationListItemDto>();

    // Modules that will provide context once they are integrated.
    public IReadOnlyCollection<string> UnavailableSources { get; set; } =
        Array.Empty<string>();
}

public sealed class EvaluationContextContributionDto
{
    public Guid Id { get; set; }

    public string Title { get; set; } = string.Empty;

    public ContributionCategory Category { get; set; }

    public DateOnly? WorkStartDate { get; set; }

    public DateOnly? WorkEndDate { get; set; }

    public DateTimeOffset? ValidatedAtUtc { get; set; }

    public EvidenceSummaryDto Evidence { get; set; } = new();

    public int CollaboratorCount { get; set; }
}
