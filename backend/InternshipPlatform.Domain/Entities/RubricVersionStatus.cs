using System.Text.Json.Serialization;

namespace InternshipPlatform.Domain.Entities;

public enum RubricVersionStatus
{
    [JsonStringEnumMemberName("draft")]
    Draft = 1,

    [JsonStringEnumMemberName("published")]
    Published = 2,

    [JsonStringEnumMemberName("archived")]
    Archived = 3
}
