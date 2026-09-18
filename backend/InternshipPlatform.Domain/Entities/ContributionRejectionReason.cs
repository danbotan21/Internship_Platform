using System.Text.Json.Serialization;

namespace InternshipPlatform.Domain.Entities;

public enum ContributionRejectionReason
{
    [JsonStringEnumMemberName("evidenceNotVerifiable")]
    EvidenceNotVerifiable = 1,

    [JsonStringEnumMemberName("outsideInternshipScope")]
    OutsideInternshipScope = 2,

    [JsonStringEnumMemberName("duplicate")]
    Duplicate = 3,

    [JsonStringEnumMemberName("attributionIncorrect")]
    AttributionIncorrect = 4,

    [JsonStringEnumMemberName("other")]
    Other = 5
}
