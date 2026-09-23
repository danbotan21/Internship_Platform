using System.Text.Json.Serialization;

namespace InternshipPlatform.Domain.Entities;

public enum EvaluationStatus
{
    [JsonStringEnumMemberName("draft")]
    Draft = 1,

    [JsonStringEnumMemberName("readyForReview")]
    ReadyForReview = 2,

    [JsonStringEnumMemberName("finalized")]
    Finalized = 3
}
