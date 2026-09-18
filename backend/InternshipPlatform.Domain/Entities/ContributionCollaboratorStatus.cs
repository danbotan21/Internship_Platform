using System.Text.Json.Serialization;

namespace InternshipPlatform.Domain.Entities;

public enum ContributionCollaboratorStatus
{
    [JsonStringEnumMemberName("Pending confirmation")]
    PendingConfirmation = 1,

    [JsonStringEnumMemberName("Confirmed")]
    Confirmed = 2,

    [JsonStringEnumMemberName("Disputed")]
    Disputed = 3,

    [JsonStringEnumMemberName("Resolved")]
    Resolved = 4
}
