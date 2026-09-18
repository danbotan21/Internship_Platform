using System.Text.Json.Serialization;

namespace InternshipPlatform.Domain.Entities;

public enum ContributionReviewCriterion
{
    [JsonStringEnumMemberName("evidenceVerifiable")]
    EvidenceVerifiable = 1,

    [JsonStringEnumMemberName("matchesDeclaredRole")]
    MatchesDeclaredRole = 2,

    [JsonStringEnumMemberName("attributionAccurate")]
    AttributionAccurate = 3,

    [JsonStringEnumMemberName("withinInternshipScope")]
    WithinInternshipScope = 4,

    [JsonStringEnumMemberName("qualityAcceptable")]
    QualityAcceptable = 5
}
