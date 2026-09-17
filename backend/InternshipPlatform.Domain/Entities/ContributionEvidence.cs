namespace InternshipPlatform.Domain.Entities;

public class ContributionEvidence
{
    public Guid Id { get; set; }

    public Guid ContributionRevisionId { get; set; }

    public EvidenceType Type { get; set; }

    public string Name { get; set; } = string.Empty;

    public string? ExternalUrl { get; set; }

    public string? StoragePath { get; set; }

    public string? OriginalFileName { get; set; }

    public string? ContentType { get; set; }

    public long? FileSizeBytes { get; set; }

    public DateTimeOffset CreatedAtUtc { get; set; }

    public ContributionRevision ContributionRevision { get; set; } = null!;
}
