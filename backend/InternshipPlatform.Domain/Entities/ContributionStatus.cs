using System.Text.Json.Serialization;

namespace InternshipPlatform.Domain.Entities;

public enum ContributionStatus
{
    [JsonStringEnumMemberName("draft")]
    Draft = 1,

    [JsonStringEnumMemberName("submitted")]
    Submitted = 2,

    [JsonStringEnumMemberName("changesRequested")]
    ChangesRequested = 3,

    [JsonStringEnumMemberName("validated")]
    Validated = 4,

    [JsonStringEnumMemberName("rejected")]
    Rejected = 5
}
