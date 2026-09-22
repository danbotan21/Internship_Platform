using System;
using System.Collections.Generic;

namespace InternshipPlatform.BusinessLayer.DTOs;

public class CreateDocumentDto
{
    public string Title { get; set; } = string.Empty;
    public string FileName { get; set; } = string.Empty;
    public string Category { get; set; } = "Other";
    public string FileType { get; set; } = "pdf";
    public long Size { get; set; }
    public string VisibilityRole { get; set; } = "Public";
    public bool IsMandatory { get; set; } = false;
    public string UploadedBy { get; set; } = "Ana Popescu";
    public string? FileUrl { get; set; }
}

public class UpdateDocumentStatusDto
{
    public string Status { get; set; } = string.Empty; // Approved, Rejected, Pending, etc.
    public string? Reason { get; set; }
    public string PerformedBy { get; set; } = "Current User";
}

public class SignDocumentDto
{
    public string Role { get; set; } = "Student"; // Student, Mentor, University
    public string SignedBy { get; set; } = "Ana Popescu";
    public string? SignatureHash { get; set; }
}

public class DocumentStatsDto
{
    public int PendingSignOffsCount { get; set; } = 4;
    public int DueThisWeekCount { get; set; } = 2;
    public double CompletedAgreementsPercentage { get; set; } = 86;
    public string CompletedAgreementsTrend { get; set; } = "+6% vs last month";
    public int ExpiringDocumentsCount { get; set; } = 2;
    public string ExpiringDocumentsAlert { get; set; } = "Within 14 days";
    public int VerificationScore { get; set; } = 92;
    public string VerificationScoreSubtitle { get; set; } = "All required docs signed";
    public long StorageUsedBytes { get; set; } = 3900000; // 3.9 MB
    public long StorageTotalBytes { get; set; } = 50000000; // 50 MB
}

public class BatchActionDto
{
    public List<Guid> DocumentIds { get; set; } = new();
    public string Action { get; set; } = string.Empty; // Delete, Approve, Reject
    public string? Reason { get; set; }
    public string PerformedBy { get; set; } = "Current User";
}

public class ComplianceGateDto
{
    public bool IsComplianceSigned { get; set; }
    public string DocumentTitle { get; set; } = "Health & Safety Compliance Form";
    public DateTime? SignedAt { get; set; }
    public string? SignedBy { get; set; }
}

public class CertificateDto
{
    public Guid DocumentId { get; set; }
    public string RecipientName { get; set; } = "Ana Popescu";
    public string ProgramName { get; set; } = "Full-Stack Software Engineering Internship";
    public string Organization { get; set; } = "Internflow Tech Labs";
    public DateTime CompletionDate { get; set; } = DateTime.UtcNow;
    public string CertificateNumber { get; set; } = "IF-2025-0894";
    public string DownloadUrl { get; set; } = string.Empty;
}
