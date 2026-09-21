using InternshipPlatform.Domain.Entities;

namespace InternshipPlatform.Domain;

public class User
{
    public Guid Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public UserRole Role { get; set; }
    public DateTime CreatedAt { get; set; }

    // Navigation properties
    public List<RefreshToken> RefreshTokens { get; set; } = [];

    public List<Opportunity> Opportunities { get; set; } = [];

    public List<Application> Applications { get; set; } = [];

    // Saved opportunities (many-to-many via join table)
    public List<Opportunity> SavedOpportunities { get; set; } = [];
}
