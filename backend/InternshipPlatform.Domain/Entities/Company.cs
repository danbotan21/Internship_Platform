using InternshipPlatform.Domain.Enums;

namespace InternshipPlatform.Domain.Entities;

public class Company
{
    public Guid Id { get; set; }

    public required string LegalName { get; set; }
    public required string RegistrationNumber { get; set; }
    public required string Website { get; set; }
    public required string Headquarters { get; set; }
    public required string Industry { get; set; }
    public required string CompanySize { get; set; }

    public CompanyStatus Status { get; set; }

    public DateTimeOffset VerifiedAt { get; set; }
    public DateTimeOffset? SuspendedAt { get; set; }

    public ICollection<CompanyMembership> Memberships { get; set; } = new List<CompanyMembership>();
}