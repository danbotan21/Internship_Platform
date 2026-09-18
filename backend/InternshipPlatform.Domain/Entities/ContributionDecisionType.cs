using System.Text.Json.Serialization;

namespace InternshipPlatform.Domain.Entities;

public enum ContributionDecisionType
{
    [JsonStringEnumMemberName("Validated")]
    Validated = 1,

    [JsonStringEnumMemberName("Rejected")]
    Rejected = 2
}
