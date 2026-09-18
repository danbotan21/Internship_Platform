using System.Text.Json.Serialization;

namespace InternshipPlatform.Domain.Entities;

public enum ContributionReviewOutcome
{
    [JsonStringEnumMemberName("changesRequested")]
    ChangesRequested = 1,

    [JsonStringEnumMemberName("validated")]
    Validated = 2,

    [JsonStringEnumMemberName("rejected")]
    Rejected = 3
}
