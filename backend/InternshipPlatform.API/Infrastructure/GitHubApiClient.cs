using System.Net;
using System.Net.Http.Headers;
using System.Text.Json;
using System.Text.RegularExpressions;
using InternshipPlatform.BusinessLayer.Interfaces;
using InternshipPlatform.Domain.Models;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Options;

namespace InternshipPlatform.API.Infrastructure;

public sealed class GitHubOptions
{
    // Team repositories evidence may come from, as "owner/name".
    public List<string> AllowedRepositories { get; set; } = [];

    // Optional personal access token (user secrets). Without it GitHub allows
    // only 60 requests per hour, so responses are cached.
    public string? Token { get; set; }
}

// Read-only client for the public GitHub REST API.
public sealed partial class GitHubApiClient : IGitHubAction
{
    private static readonly TimeSpan ShortCache = TimeSpan.FromMinutes(2);
    private static readonly TimeSpan LongCache = TimeSpan.FromMinutes(30);
    private const int MaximumFiles = 50;

    private readonly HttpClient _http;
    private readonly IMemoryCache _cache;
    private readonly GitHubOptions _options;

    public GitHubApiClient(HttpClient http, IMemoryCache cache, IOptions<GitHubOptions> options)
    {
        _http = http;
        _cache = cache;
        _options = options.Value;

        _http.BaseAddress = new Uri("https://api.github.com/");
        _http.Timeout = TimeSpan.FromSeconds(15);
        _http.DefaultRequestHeaders.UserAgent.ParseAdd("InternshipPlatform/1.0");
        _http.DefaultRequestHeaders.Accept.ParseAdd("application/vnd.github+json");
        _http.DefaultRequestHeaders.Add("X-GitHub-Api-Version", "2022-11-28");
        if (!string.IsNullOrWhiteSpace(_options.Token))
        {
            _http.DefaultRequestHeaders.Authorization =
                new AuthenticationHeaderValue("Bearer", _options.Token);
        }
    }

    public IReadOnlyList<string> AllowedRepositories => _options.AllowedRepositories;

    public Task<GitHubRepositoryOptionDto> GetRepositoryAsync(
        string repository,
        CancellationToken ct = default) =>
        CachedAsync($"repo:{repository}", TimeSpan.FromMinutes(10), async () =>
        {
            using var repo = await GetJsonAsync($"repos/{repository}", ct);
            using var branches = await GetJsonAsync($"repos/{repository}/branches?per_page=100", ct);
            return new GitHubRepositoryOptionDto
            {
                FullName = repository,
                DefaultBranch = repo.RootElement.GetProperty("default_branch").GetString() ?? "main",
                Branches = branches.RootElement.EnumerateArray()
                    .Select(branch => branch.GetProperty("name").GetString() ?? string.Empty)
                    .Where(name => name.Length != 0)
                    .ToList()
            };
        });

    public Task<IReadOnlyList<GitHubCommitOptionDto>> GetCommitsByAuthorAsync(
        string repository,
        string branch,
        string authorLogin,
        CancellationToken ct = default) =>
        CachedAsync<IReadOnlyList<GitHubCommitOptionDto>>(
            $"commits:{repository}:{branch}:{authorLogin}".ToLowerInvariant(),
            ShortCache,
            async () =>
            {
                using var json = await GetJsonAsync(
                    $"repos/{repository}/commits?sha={Uri.EscapeDataString(branch)}&author={Uri.EscapeDataString(authorLogin)}&per_page=30",
                    ct);
                return json.RootElement.EnumerateArray()
                    .Select(commit => new GitHubCommitOptionDto
                    {
                        Sha = commit.GetProperty("sha").GetString()!,
                        Message = FirstLine(commit.GetProperty("commit").GetProperty("message").GetString()),
                        AuthoredAtUtc = ReadDate(commit.GetProperty("commit").GetProperty("author"), "date"),
                        Url = commit.GetProperty("html_url").GetString()!
                    })
                    .ToList();
            });

    public Task<IReadOnlyList<GitHubPullRequestOptionDto>> GetPullRequestsByAuthorAsync(
        string repository,
        string authorLogin,
        CancellationToken ct = default) =>
        CachedAsync<IReadOnlyList<GitHubPullRequestOptionDto>>(
            $"pulls:{repository}:{authorLogin}".ToLowerInvariant(),
            ShortCache,
            async () =>
            {
                using var json = await GetJsonAsync(
                    $"repos/{repository}/pulls?state=all&per_page=100&sort=created&direction=desc",
                    ct);
                return json.RootElement.EnumerateArray()
                    .Where(pull => string.Equals(
                        ReadLogin(pull, "user"), authorLogin, StringComparison.OrdinalIgnoreCase))
                    .Select(pull => new GitHubPullRequestOptionDto
                    {
                        Number = pull.GetProperty("number").GetInt32(),
                        Title = pull.GetProperty("title").GetString() ?? string.Empty,
                        State = PullRequestState(pull),
                        CreatedAtUtc = ReadDate(pull, "created_at") ?? DateTimeOffset.MinValue,
                        Url = pull.GetProperty("html_url").GetString()!
                    })
                    .ToList();
            });

    public Task<GitHubCommitSnapshot> GetCommitAsync(
        string repository,
        string sha,
        CancellationToken ct = default) =>
        CachedAsync($"commit:{repository}:{sha}".ToLowerInvariant(), LongCache, async () =>
        {
            using var json = await GetJsonAsync($"repos/{repository}/commits/{sha}", ct);
            var root = json.RootElement;
            var fullSha = root.GetProperty("sha").GetString()!;
            var message = root.GetProperty("commit").GetProperty("message").GetString() ?? string.Empty;
            var stats = root.GetProperty("stats");

            return new GitHubCommitSnapshot(
                repository,
                fullSha,
                message,
                ReadLogin(root, "author"),
                ReadDate(root.GetProperty("commit").GetProperty("author"), "date"),
                stats.GetProperty("additions").GetInt32(),
                stats.GetProperty("deletions").GetInt32(),
                ReadFiles(root.GetProperty("files")),
                CoAuthorPattern().Matches(message).Select(match => match.Groups["email"].Value).ToList(),
                root.GetProperty("html_url").GetString()!,
                await GetChecksConclusionAsync(repository, fullSha, ct));
        });

    public Task<GitHubPullRequestSnapshot> GetPullRequestAsync(
        string repository,
        int number,
        CancellationToken ct = default) =>
        CachedAsync($"pull:{repository}:{number}".ToLowerInvariant(), ShortCache, async () =>
        {
            using var json = await GetJsonAsync($"repos/{repository}/pulls/{number}", ct);
            using var commits = await GetJsonAsync($"repos/{repository}/pulls/{number}/commits?per_page=100", ct);
            using var files = await GetJsonAsync($"repos/{repository}/pulls/{number}/files?per_page={MaximumFiles}", ct);
            var root = json.RootElement;
            var headSha = root.GetProperty("head").GetProperty("sha").GetString()!;

            return new GitHubPullRequestSnapshot(
                repository,
                number,
                root.GetProperty("title").GetString() ?? string.Empty,
                PullRequestState(root),
                ReadLogin(root, "user"),
                ReadDate(root, "created_at") ?? DateTimeOffset.UtcNow,
                ReadDate(root, "merged_at"),
                root.GetProperty("additions").GetInt32(),
                root.GetProperty("deletions").GetInt32(),
                root.GetProperty("changed_files").GetInt32(),
                commits.RootElement.EnumerateArray()
                    .Select(commit => new GitHubCommitDto
                    {
                        Sha = commit.GetProperty("sha").GetString()!,
                        Message = FirstLine(commit.GetProperty("commit").GetProperty("message").GetString()),
                        AuthorLogin = ReadLogin(commit, "author"),
                        AuthoredAtUtc = ReadDate(commit.GetProperty("commit").GetProperty("author"), "date")
                    })
                    .ToList(),
                ReadFiles(files.RootElement),
                root.GetProperty("html_url").GetString()!,
                await GetChecksConclusionAsync(repository, headSha, ct));
        });

    public Task<GitHubIssueSnapshot> GetIssueAsync(
        string repository,
        int number,
        CancellationToken ct = default) =>
        CachedAsync($"issue:{repository}:{number}".ToLowerInvariant(), TimeSpan.FromMinutes(10), async () =>
        {
            using var json = await GetJsonAsync($"repos/{repository}/issues/{number}", ct);
            var root = json.RootElement;
            if (root.TryGetProperty("pull_request", out _))
            {
                throw new GitHubUnavailableException(
                    $"#{number} is a pull request, not an issue. Add it as evidence instead.");
            }

            return new GitHubIssueSnapshot(
                repository,
                number,
                root.GetProperty("title").GetString() ?? string.Empty,
                root.GetProperty("state").GetString() ?? "open",
                root.GetProperty("html_url").GetString()!);
        });

    public Task<string> GetChecksConclusionAsync(
        string repository,
        string sha,
        CancellationToken ct = default) =>
        CachedAsync($"checks:{repository}:{sha}".ToLowerInvariant(), ShortCache, async () =>
        {
            using var json = await GetJsonAsync($"repos/{repository}/commits/{sha}/check-runs?per_page=100", ct);
            var runs = json.RootElement.GetProperty("check_runs").EnumerateArray().ToList();
            if (runs.Count == 0)
            {
                return "none";
            }

            var conclusions = runs
                .Select(run => run.GetProperty("conclusion").ValueKind == JsonValueKind.Null
                    ? null
                    : run.GetProperty("conclusion").GetString())
                .ToList();
            if (conclusions.Any(conclusion =>
                    conclusion is "failure" or "cancelled" or "timed_out" or "action_required"))
            {
                return "failure";
            }

            return conclusions.Any(conclusion => conclusion is null) ? "pending" : "success";
        });

    // ---- HTTP -------------------------------------------------------------
    private async Task<JsonDocument> GetJsonAsync(string path, CancellationToken ct)
    {
        HttpResponseMessage response;
        try
        {
            response = await _http.GetAsync(path, ct);
        }
        catch (Exception ex) when (ex is HttpRequestException or TaskCanceledException && !ct.IsCancellationRequested)
        {
            throw new GitHubUnavailableException("GitHub could not be reached. Try again in a moment.");
        }

        using (response)
        {
            if (response.IsSuccessStatusCode)
            {
                await using var stream = await response.Content.ReadAsStreamAsync(ct);
                return await JsonDocument.ParseAsync(stream, cancellationToken: ct);
            }

            if (response.StatusCode is HttpStatusCode.NotFound or HttpStatusCode.UnprocessableEntity)
            {
                throw new GitHubUnavailableException("GitHub could not find this item in the repository.");
            }

            if (response.StatusCode is HttpStatusCode.Forbidden or HttpStatusCode.TooManyRequests &&
                response.Headers.TryGetValues("X-RateLimit-Remaining", out var remaining) &&
                remaining.FirstOrDefault() == "0")
            {
                var resetAt = response.Headers.TryGetValues("X-RateLimit-Reset", out var reset) &&
                    long.TryParse(reset.FirstOrDefault(), out var seconds)
                        ? DateTimeOffset.FromUnixTimeSeconds(seconds).ToLocalTime().ToString("HH:mm")
                        : "later";
                throw new GitHubUnavailableException(
                    $"GitHub's request limit was reached. Try again after {resetAt} " +
                    "(a GitHub token in the server configuration raises the limit).");
            }

            throw new GitHubUnavailableException(
                $"GitHub answered with an error ({(int)response.StatusCode}). Try again in a moment.");
        }
    }

    private async Task<T> CachedAsync<T>(string key, TimeSpan duration, Func<Task<T>> factory)
    {
        if (_cache.TryGetValue(key, out T? cached) && cached is not null)
        {
            return cached;
        }

        var value = await factory();
        _cache.Set(key, value, duration);
        return value;
    }

    // ---- JSON helpers -----------------------------------------------------
    private static string? ReadLogin(JsonElement element, string property) =>
        element.TryGetProperty(property, out var user) && user.ValueKind == JsonValueKind.Object
            ? user.GetProperty("login").GetString()
            : null;

    private static DateTimeOffset? ReadDate(JsonElement element, string property) =>
        element.TryGetProperty(property, out var value) && value.ValueKind == JsonValueKind.String
            ? value.GetDateTimeOffset()
            : null;

    private static string PullRequestState(JsonElement pull) =>
        ReadDate(pull, "merged_at") is not null
            ? "merged"
            : pull.GetProperty("state").GetString() ?? "open";

    private static string FirstLine(string? message) =>
        (message ?? string.Empty).Split('\n', 2)[0].Trim();

    private static IReadOnlyList<GitHubFileDto> ReadFiles(JsonElement files) =>
        files.ValueKind != JsonValueKind.Array
            ? []
            : files.EnumerateArray()
                .Take(MaximumFiles)
                .Select(file => new GitHubFileDto
                {
                    Filename = file.GetProperty("filename").GetString() ?? string.Empty,
                    Status = file.GetProperty("status").GetString() ?? string.Empty,
                    Additions = file.GetProperty("additions").GetInt32(),
                    Deletions = file.GetProperty("deletions").GetInt32()
                })
                .ToList();

    [GeneratedRegex(@"^Co-authored-by:\s*.+?<(?<email>[^>]+)>\s*$", RegexOptions.IgnoreCase | RegexOptions.Multiline)]
    private static partial Regex CoAuthorPattern();
}
