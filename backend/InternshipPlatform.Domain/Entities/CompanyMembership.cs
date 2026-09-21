using InternshipPlatform.Domain.Enums;

namespace InternshipPlatform.Domain.Entities;

public class CompanyMembership
{
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;

    public Guid CompanyId { get; set; }
    public Company Company { get; set; } = null!;

    public CompanyRole Role { get; set; }
    public DateTimeOffset JoinedAt { get; set; }
}