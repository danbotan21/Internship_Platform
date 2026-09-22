using System;

namespace InternshipPlatform.Domain.Entities;

public class DocumentAudit
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid DocumentId { get; set; }
    public Document? Document { get; set; }
    public string Action { get; set; } = string.Empty; // Uploaded, StatusChanged, Signed, Rejected, VersionBumped, Downloaded
    public string PerformedBy { get; set; } = string.Empty;
    public string? Details { get; set; }
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
}
