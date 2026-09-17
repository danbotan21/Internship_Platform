using InternshipPlatform.Domain.Enums;

namespace InternshipPlatform.Domain.Entities;

public class CompanyVerificationRequest
{
    public Guid Id { get; set; }
    
    public required string LegalName { get; set; }
    public required string RegistrationNumber { get; set; }
    public required string Website { get; set; }
    public required string Headquarters { get; set; }
    public required string Industry { get; set; }
    public required string CompanySize { get; set; }

    public Guid RequesterUserId { get; set; }
    public User Requester { get; set; } = null!;

    public required string RequesterName { get; set; }
    public required string RequesterEmail { get; set; }
    public required string RequesterPosition { get; set; }
    public string? RequesterPhone { get; set; }

    public VerificationStatus Status { get; set; }
    public DateTimeOffset CreatedAt { get; set; }

    public DateTimeOffset? DecidedAt { get; set; }
    public Guid? DecidedByUserId { get; set; }
    public User? DecidedBy { get; set; }
    public string? RejectionReason { get; set; }

    public Guid? CompanyId { get; set; }
    public Company? Company { get; set; }
}
