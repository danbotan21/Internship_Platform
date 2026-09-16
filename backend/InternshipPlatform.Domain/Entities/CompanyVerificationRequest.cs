using InternshipPlatform.Domain.Enums;

namespace InternshipPlatform.Domain.Entities;

public class CompanyVerificationRequest
{
    public Guid Id { get; set; }
    
    public required string LegalName { get; set; }
    public required string RegistrationNumber { get; set; }
    public required string Website { get; set; }
    public required string HeadQuarters { get; set; }
    public required string Industry { get; set; }
    public required string CompanySize { get; set; }

    public Guid? RequesterUserId { get; set; }
    public required string RequesterName { get; set; }
    public required string RequesterEmail { get; set; }
    public required string RequesterPosition { get; set; }
    public string? RequesterPhone { get; set; }

    public VerificationStatus Status { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset? DecidedAt { get; set; }
    public Guid? DecidedByUserId { get; set; }
    public string? RejectionReason { get; set; }
}
