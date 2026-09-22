using System.Text.Json.Serialization;

namespace InternshipPlatform.Domain.Entities;

public enum EvidenceType
{
    [JsonStringEnumMemberName("link")]
    Link = 1,

    [JsonStringEnumMemberName("document")]
    Document = 2,

    [JsonStringEnumMemberName("image")]
    Image = 3,

    [JsonStringEnumMemberName("githubCommit")]
    GitHubCommit = 4,

    [JsonStringEnumMemberName("githubPullRequest")]
    GitHubPullRequest = 5
}
