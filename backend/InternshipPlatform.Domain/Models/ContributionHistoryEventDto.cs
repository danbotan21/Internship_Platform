using System.Text.Json.Serialization;

namespace InternshipPlatform.Domain.Models;

public enum ContributionHistoryEventType
{
    [JsonStringEnumMemberName("submitted")]
    Submitted = 1,

    [JsonStringEnumMemberName("changesRequested")]
    ChangesRequested = 2,

    [JsonStringEnumMemberName("resubmitted")]
    Resubmitted = 3,

    [JsonStringEnumMemberName("validated")]
    Validated = 4,

    [JsonStringEnumMemberName("rejected")]
    Rejected = 5
}

public sealed class ContributionHistoryEventDto
{
    public Guid Id { get; set; }

    public ContributionHistoryEventType Type { get; set; }

    public int RevisionNumber { get; set; }

    public DateTimeOffset OccurredAtUtc { get; set; }

    public string? ActorName { get; set; }

    public string? Note { get; set; }
}
