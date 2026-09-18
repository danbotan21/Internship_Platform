using InternshipPlatform.Domain.Entities;

namespace InternshipPlatform.Domain.Models;

public sealed class ContributionRevisionDto
{
    public Guid Id { get; set; }

    public int RevisionNumber { get; set; }

    public string Title { get; set; } = string.Empty;

    public ContributionCategory Category { get; set; }

    public string WorkPeriod { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public string OwnRole { get; set; } = string.Empty;

    public string? LinkedTaskReference { get; set; }

    public string? EvidenceNote { get; set; }

    public string? RevisionNote { get; set; }

    public DateTimeOffset? SubmittedAtUtc { get; set; }

    public IReadOnlyCollection<ContributionEvidenceDto> Evidence { get; set; } =
        Array.Empty<ContributionEvidenceDto>();

    public IReadOnlyCollection<ContributionReviewDto> Reviews { get; set; } =
        Array.Empty<ContributionReviewDto>();

    public IReadOnlyCollection<ContributionDecisionDto> Decisions { get; set; } =
        Array.Empty<ContributionDecisionDto>();
}
