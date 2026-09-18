using System.Text.Json.Serialization;

namespace InternshipPlatform.Domain.Entities;

public enum ContributionCategory
{
    [JsonStringEnumMemberName("development")]
    Development = 1,

    [JsonStringEnumMemberName("uiUxDesign")]
    UiUxDesign = 2,

    [JsonStringEnumMemberName("testing")]
    Testing = 3,

    [JsonStringEnumMemberName("documentation")]
    Documentation = 4,

    [JsonStringEnumMemberName("research")]
    Research = 5,

    [JsonStringEnumMemberName("other")]
    Other = 6
}
