using System.Text.Json.Serialization;

namespace InternshipPlatform.Domain.Entities;

public enum EvidenceType
{
    [JsonStringEnumMemberName("link")]
    Link = 1,

    [JsonStringEnumMemberName("file")]
    File = 2
}
