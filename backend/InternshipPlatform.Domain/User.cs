namespace InternshipPlatform.Domain;

public class User
{
    public Guid Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public UserRole Role { get; set; }
    public DateTime CreatedAt { get; set; }

    /// <summary>University or company the user belongs to.</summary>
    public string Organization { get; set; } = string.Empty;

    /// <summary>Drives the presence dot; null until the user has connected once.</summary>
    public DateTime? LastSeenAt { get; set; }

    /// <summary>Set for interns: the mentor they are assigned to.</summary>
    public Guid? MentorId { get; set; }
    public User? Mentor { get; set; }
    public List<User> Mentees { get; set; } = [];

    public ContactInfo Contact { get; set; } = new();

    public List<RefreshToken> RefreshTokens { get; set; } = [];
    public List<ConversationMember> ConversationMemberships { get; set; } = [];
    public List<Message> Messages { get; set; } = [];
}
