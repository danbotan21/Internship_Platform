using InternshipPlatform.Domain.Models;

namespace InternshipPlatform.BusinessLayer.Interfaces;

public sealed record GitHubCommitSnapshot(
    string Repository,
    string Sha,
    string Message,
    string? AuthorLogin,
    DateTimeOffset? AuthoredAtUtc,
    int Additions,
    int Deletions,
    IReadOnlyList<GitHubFileDto> Files,
    IReadOnlyList<string> CoAuthorEmails,
    string HtmlUrl,
    string ChecksConclusion);

public sealed record GitHubPullRequestSnapshot(
    string Repository,
    int Number,
    string Title,
    string State,
    string? AuthorLogin,
    DateTimeOffset CreatedAtUtc,
    DateTimeOffset? MergedAtUtc,
    int Additions,
    int Deletions,
    int ChangedFiles,
    IReadOnlyList<GitHubCommitDto> Commits,
    IReadOnlyList<GitHubFileDto> Files,
    string HtmlUrl,
    string ChecksConclusion);

public sealed record GitHubIssueSnapshot(
    string Repository,
    int Number,
    string Title,
    string State,
    string HtmlUrl);

// Thrown when GitHub cannot answer (rate limit, not found, network).
public sealed class GitHubUnavailableException(string message) : Exception(message);

public interface IGitHubAction
{
    // Team repositories evidence may come from ("owner/name").
    IReadOnlyList<string> AllowedRepositories { get; }

    Task<GitHubRepositoryOptionDto> GetRepositoryAsync(
        string repository,
        CancellationToken ct = default);

    Task<IReadOnlyList<GitHubCommitOptionDto>> GetCommitsByAuthorAsync(
        string repository,
        string branch,
        string authorLogin,
        CancellationToken ct = default);

    Task<IReadOnlyList<GitHubPullRequestOptionDto>> GetPullRequestsByAuthorAsync(
        string repository,
        string authorLogin,
        CancellationToken ct = default);

    Task<GitHubCommitSnapshot> GetCommitAsync(
        string repository,
        string sha,
        CancellationToken ct = default);

    Task<GitHubPullRequestSnapshot> GetPullRequestAsync(
        string repository,
        int number,
        CancellationToken ct = default);

    Task<GitHubIssueSnapshot> GetIssueAsync(
        string repository,
        int number,
        CancellationToken ct = default);

    Task<string> GetChecksConclusionAsync(
        string repository,
        string sha,
        CancellationToken ct = default);
}
