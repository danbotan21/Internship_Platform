using System;
using System.Collections.Generic;

namespace InternshipPlatform.Domain.Entities;

public class Document
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Title { get; set; } = string.Empty;
    public string FileName { get; set; } = string.Empty;
    public string Category { get; set; } = "Other"; // Report, Certificate, Evaluation, Agreement, Template, Other
    public string FileUrl { get; set; } = string.Empty;
    public string FileType { get; set; } = "pdf"; // pdf, docx, xlsx
    public long Size { get; set; } // in bytes
    public int Version { get; set; } = 1;
    public string Status { get; set; } = "Pending"; // Draft, Submitted, Pending, Approved, Rejected, Expiring, Complete
    public string SigningStatus { get; set; } = "Draft"; // Draft, Submitted, SignedByStudent, SignedByMentor, SignedByUniversity, Complete
    public int TotalSignatures { get; set; } = 3;
    public int CompletedSignatures { get; set; } = 0;
    public string VisibilityRole { get; set; } = "Public"; // Public, StudentOnly, MentorOnly, AdminOnly
    public bool IsMandatory { get; set; } = false;
    public string? RejectionReason { get; set; }
    public DateTime? ApprovedAt { get; set; }
    public string? ApprovedBy { get; set; }
    public DateTime? ExpiresAt { get; set; }
    public string UploadedBy { get; set; } = "Ana Popescu";
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<DocumentAudit> Audits { get; set; } = new List<DocumentAudit>();
}
