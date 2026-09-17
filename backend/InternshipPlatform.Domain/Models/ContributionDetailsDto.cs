using InternshipPlatform.Domain.Entities;

namespace InternshipPlatform.Domain.Models;

public sealed class ContributionDetailsDto
{
    public Guid Id { get; set; }

    public Guid StudentId { get; set; }

    public string? StudentDisplayName { get; set; }

    public ContributionStatus Status { get; set; }

    public int CurrentRevisionNumber { get; set; }

    public DateTimeOffset CreatedAtUtc { get; set; }

    public DateTimeOffset UpdatedAtUtc { get; set; }

    public DateTimeOffset? SubmittedAtUtc { get; set; }

    public ContributionRevisionDto CurrentRevision { get; set; } = new();

    public ContributionReviewDto? LatestReview { get; set; }

    public IReadOnlyCollection<ContributionHistoryEventDto> History { get; set; } =
        Array.Empty<ContributionHistoryEventDto>();
}
