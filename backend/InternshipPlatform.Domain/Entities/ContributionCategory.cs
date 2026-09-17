using System.Text.Json.Serialization;

namespace InternshipPlatform.Domain.Entities;

public enum ContributionCategory
{
    [JsonStringEnumMemberName("Development")]
    Development = 1,

    [JsonStringEnumMemberName("UI / UX design")]
    UiUxDesign = 2,

    [JsonStringEnumMemberName("Testing")]
    Testing = 3,

    [JsonStringEnumMemberName("Documentation")]
    Documentation = 4,

    [JsonStringEnumMemberName("Research")]
    Research = 5,

    [JsonStringEnumMemberName("Other")]
    Other = 6
}
