using InternshipPlatform.Domain.Entities;

namespace InternshipPlatform.Domain.Models;

public sealed class ContributionRevisionDto
{
    public Guid Id { get; set; }

    public int RevisionNumber { get; set; }

    public string Title { get; set; } = string.Empty;

    public ContributionCategory Category { get; set; }

    public DateOnly? WorkStartDate { get; set; }

    public DateOnly? WorkEndDate { get; set; }

    public string Description { get; set; } = string.Empty;

    public string OwnRole { get; set; } = string.Empty;

    public LinkedIssueDto? LinkedIssue { get; set; }

    public string? RevisionNote { get; set; }

    public DateTimeOffset? SubmittedAtUtc { get; set; }

    public IReadOnlyCollection<ContributionEvidenceDto> Evidence { get; set; } =
        Array.Empty<ContributionEvidenceDto>();
}

public sealed class LinkedIssueDto
{
    public string Repository { get; set; } = string.Empty;

    public int Number { get; set; }

    public string? Title { get; set; }

    public string? State { get; set; }

    public string Url { get; set; } = string.Empty;
}
