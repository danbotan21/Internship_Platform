using InternshipPlatform.Domain.Entities;

namespace InternshipPlatform.Domain.Models;

public sealed class ContributionListItemDto
{
    public Guid Id { get; set; }

    public Guid StudentId { get; set; }

    public string? StudentDisplayName { get; set; }

    public string Title { get; set; } = string.Empty;

    public ContributionCategory Category { get; set; }

    public string WorkPeriod { get; set; } = string.Empty;

    public ContributionStatus Status { get; set; }

    public int EvidenceCount { get; set; }

    public int CurrentRevisionNumber { get; set; }

    public DateTimeOffset UpdatedAtUtc { get; set; }

    public DateTimeOffset? SubmittedAtUtc { get; set; }
}
