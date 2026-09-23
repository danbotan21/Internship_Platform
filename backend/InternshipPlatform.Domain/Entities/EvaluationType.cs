using System.Text.Json.Serialization;

namespace InternshipPlatform.Domain.Entities;

public enum EvaluationType
{
    [JsonStringEnumMemberName("initial")]
    Initial = 1,

    [JsonStringEnumMemberName("midTerm")]
    MidTerm = 2,

    [JsonStringEnumMemberName("final")]
    Final = 3
}
