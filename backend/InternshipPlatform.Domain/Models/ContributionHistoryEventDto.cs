namespace InternshipPlatform.Domain.Models;

public enum ContributionHistoryEventType
{
    Submitted = 1,
    ChangesRequested = 2,
    Resubmitted = 3,
    Validated = 4,
    Rejected = 5
}

public sealed class ContributionHistoryEventDto
{
    public Guid Id { get; set; }

    public ContributionHistoryEventType Type { get; set; }

    public int RevisionNumber { get; set; }

    public DateTimeOffset OccurredAtUtc { get; set; }

    public string? Note { get; set; }
}
