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

    /// <summary>University or company the user belongs to.</summary>
    public string Organization { get; set; } = string.Empty;

    /// <summary>Drives the presence dot; null until the user has connected once.</summary>
    public DateTime? LastSeenAt { get; set; }

    // Contribution Management integration fields.
    // They remain nullable for users that are not assigned to an internship.
    /// <summary>Set for interns: the mentor they are assigned to.</summary>
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

    public ContactInfo Contact { get; set; } = new();

    // Navigation properties
    public List<RefreshToken> RefreshTokens { get; set; } = [];
    public List<ConversationMember> ConversationMemberships { get; set; } = [];
    public List<Message> Messages { get; set; } = [];

    [System.ComponentModel.DataAnnotations.Schema.InverseProperty("Mentor")]
    public List<Opportunity> Opportunities { get; set; } = [];

    public List<Application> Applications { get; set; } = [];

    // Saved opportunities (many-to-many via join table)
    public List<Opportunity> SavedOpportunities { get; set; } = [];
}
