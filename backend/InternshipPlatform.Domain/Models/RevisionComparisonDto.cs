namespace InternshipPlatform.Domain.Models;

// What changed between the current revision and the previous submitted one.
public sealed class RevisionComparisonDto
{
    public int ComparedWithRevision { get; set; }

    public IReadOnlyCollection<RevisionFieldChangeDto> FieldChanges { get; set; } =
        Array.Empty<RevisionFieldChangeDto>();

    public IReadOnlyCollection<string> EvidenceAdded { get; set; } =
        Array.Empty<string>();

    public IReadOnlyCollection<string> EvidenceRemoved { get; set; } =
        Array.Empty<string>();

    public bool HasChanges =>
        FieldChanges.Count != 0 || EvidenceAdded.Count != 0 || EvidenceRemoved.Count != 0;
}

public sealed class RevisionFieldChangeDto
{
    public string Field { get; set; } = string.Empty;

    public string? Before { get; set; }

    public string? After { get; set; }
}
