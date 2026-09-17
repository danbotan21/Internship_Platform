using System.Text.Json.Serialization;

namespace InternshipPlatform.Domain.Entities;

public enum ContributionStatus
{
    [JsonStringEnumMemberName("Draft")]
    Draft = 1,

    [JsonStringEnumMemberName("Submitted")]
    Submitted = 2,

    [JsonStringEnumMemberName("Changes requested")]
    ChangesRequested = 3
}
