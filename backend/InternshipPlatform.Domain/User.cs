using InternshipPlatform.Domain.Entities;
using InternshipPlatform.Domain.Enums;

namespace InternshipPlatform.Domain;
public class User
{
    public Guid Id { get; set; }

    public required string Email { get; set; }
    public required string PasswordHash { get; set; }
    public bool EmailVerified { get; set; }

    public required string FullName { get; set; }
    public string? University { get; set; }
    public string? AcademicGroup { get; set; }
    public string? Programme { get; set; }

    // Contribution Management integration fields.
    // They remain nullable for users that are not assigned to an internship.
    public Guid? MentorId { get; set; }
    public User? Mentor { get; set; }
    public List<User> Students { get; set; } = [];
    public string? GitHubUsername { get; set; }

    public UserRole Role { get; set; }
    public UserStatus Status { get; set; }

    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset? LastLoginAt { get; set; }
    public DateTimeOffset? DeactivatedAt { get; set; }

    public CompanyMembership? Membership { get; set; }

    // Navigation properties
    public List<RefreshToken> RefreshTokens { get; set; } = [];

    public List<Opportunity> Opportunities { get; set; } = [];

    public List<Application> Applications { get; set; } = [];

    // Saved opportunities (many-to-many via join table)
    public List<Opportunity> SavedOpportunities { get; set; } = [];
}
