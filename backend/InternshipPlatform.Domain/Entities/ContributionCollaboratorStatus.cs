using System.Text.Json.Serialization;

namespace InternshipPlatform.Domain.Entities;

public enum ContributionCollaboratorStatus
{
    [JsonStringEnumMemberName("pending")]
    PendingConfirmation = 1,

    [JsonStringEnumMemberName("confirmed")]
    Confirmed = 2,

    [JsonStringEnumMemberName("disputed")]
    Disputed = 3
}
