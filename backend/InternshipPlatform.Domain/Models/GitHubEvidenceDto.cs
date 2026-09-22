namespace InternshipPlatform.Domain.Models;

public sealed class GitHubEvidenceDto
{
    public string Repository { get; set; } = string.Empty;

    // Commit SHA or pull request number.
    public string Reference { get; set; } = string.Empty;

    public string? AuthorLogin { get; set; }

    public DateTimeOffset? AuthoredAtUtc { get; set; }

    public int Additions { get; set; }

    public int Deletions { get; set; }

    public int ChangedFiles { get; set; }

    public string? State { get; set; }

    public string? ChecksConclusion { get; set; }

    public IReadOnlyCollection<GitHubFileDto> Files { get; set; } =
        Array.Empty<GitHubFileDto>();

    public IReadOnlyCollection<GitHubCommitDto> Commits { get; set; } =
        Array.Empty<GitHubCommitDto>();

    public IReadOnlyCollection<string> CoAuthors { get; set; } =
        Array.Empty<string>();
}

public sealed class GitHubFileDto
{
    public string Filename { get; set; } = string.Empty;

    public string Status { get; set; } = string.Empty;

    public int Additions { get; set; }

    public int Deletions { get; set; }
}

public sealed class GitHubCommitDto
{
    public string Sha { get; set; } = string.Empty;

    public string Message { get; set; } = string.Empty;

    public string? AuthorLogin { get; set; }

    public DateTimeOffset? AuthoredAtUtc { get; set; }
}
