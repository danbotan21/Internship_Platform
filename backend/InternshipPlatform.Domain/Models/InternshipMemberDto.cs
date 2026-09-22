using System.Text.Json.Serialization;

namespace InternshipPlatform.Domain.Models;

public enum InternshipMemberRole
{
    [JsonStringEnumMemberName("student")]
    Student = 1,

    [JsonStringEnumMemberName("mentor")]
    Mentor = 2
}

// A person of the internship as seen by the contribution module.
public sealed class InternshipMemberDto
{
    public Guid UserId { get; set; }

    public string FullName { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public InternshipMemberRole Role { get; set; }

    public string? GitHubUsername { get; set; }

    // Students: their mentor. Mentors: empty.
    public Guid? MentorId { get; set; }
}
