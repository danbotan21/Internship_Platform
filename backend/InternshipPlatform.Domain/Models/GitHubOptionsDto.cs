namespace InternshipPlatform.Domain.Models;

// What the student can pick from when attaching GitHub evidence.
public sealed class GitHubRepositoryOptionDto
{
    public string FullName { get; set; } = string.Empty;

    public string DefaultBranch { get; set; } = string.Empty;

    public IReadOnlyCollection<string> Branches { get; set; } = Array.Empty<string>();
}

public sealed class GitHubCommitOptionDto
{
    public string Sha { get; set; } = string.Empty;

    public string Message { get; set; } = string.Empty;

    public DateTimeOffset? AuthoredAtUtc { get; set; }

    public string Url { get; set; } = string.Empty;
}

public sealed class GitHubPullRequestOptionDto
{
    public int Number { get; set; }

    public string Title { get; set; } = string.Empty;

    public string State { get; set; } = string.Empty;

    public DateTimeOffset CreatedAtUtc { get; set; }

    public string Url { get; set; } = string.Empty;
}

// Current GitHub state of a snapshot, loaded when the mentor opens the review.
public sealed class GitHubLiveStatusDto
{
    public Guid EvidenceId { get; set; }

    public string? State { get; set; }

    public string? ChecksConclusion { get; set; }

    public DateTimeOffset CheckedAtUtc { get; set; }

    public string? Error { get; set; }
}
