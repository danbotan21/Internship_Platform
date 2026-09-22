using System;
using System.Collections.Generic;

namespace InternshipPlatform.BusinessLayer.DTOs;

public class DocumentDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string FileName { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string FileUrl { get; set; } = string.Empty;
    public string FileType { get; set; } = "pdf";
    public long Size { get; set; }
    public int Version { get; set; }
    public string Status { get; set; } = string.Empty;
    public string SigningStatus { get; set; } = string.Empty;
    public int TotalSignatures { get; set; } = 3;
    public int CompletedSignatures { get; set; } = 0;
    public string VisibilityRole { get; set; } = "Public";
    public bool IsMandatory { get; set; }
    public string? RejectionReason { get; set; }
    public DateTime? ApprovedAt { get; set; }
    public string? ApprovedBy { get; set; }
    public DateTime? ExpiresAt { get; set; }
    public string UploadedBy { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public List<DocumentAuditDto> Audits { get; set; } = new();
}

public class DocumentAuditDto
{
    public Guid Id { get; set; }
    public Guid DocumentId { get; set; }
    public string Action { get; set; } = string.Empty;
    public string PerformedBy { get; set; } = string.Empty;
    public string? Details { get; set; }
    public DateTime Timestamp { get; set; }
}
