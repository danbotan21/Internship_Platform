namespace InternshipPlatform.Domain.Entities;

public class ContributionEvidence
{
    public Guid Id { get; set; }

    public Guid ContributionRevisionId { get; set; }

    public EvidenceType Type { get; set; }

    public string Name { get; set; } = string.Empty;

    // What the evidence proves, written by the student.
    public string? Caption { get; set; }

    // Link evidence and the GitHub page of commit / pull request evidence.
    public string? ExternalUrl { get; set; }

    // Uploaded image or document evidence.
    public string? StoragePath { get; set; }

    public string? OriginalFileName { get; set; }

    public string? ContentType { get; set; }

    public long? FileSizeBytes { get; set; }

    // GitHub snapshot taken when the evidence is added, so the mentor reviews
    // exactly what the student submitted.
    public string? GitHubRepository { get; set; }

    // Commit SHA or pull request number.
    public string? GitHubReference { get; set; }

    public string? GitHubAuthorLogin { get; set; }

    public DateTimeOffset? GitHubAuthoredAtUtc { get; set; }

    public int? GitHubAdditions { get; set; }

    public int? GitHubDeletions { get; set; }

    public int? GitHubChangedFiles { get; set; }

    // Pull request state: open, closed or merged.
    public string? GitHubState { get; set; }

    // success, failure, pending or none (no CI configured).
    public string? GitHubChecksConclusion { get; set; }

    // Changed files, pull request commits and co-authors (jsonb).
    public string? GitHubDetailsJson { get; set; }

    public DateTimeOffset CreatedAtUtc { get; set; }

    public ContributionRevision ContributionRevision { get; set; } = null!;
}
