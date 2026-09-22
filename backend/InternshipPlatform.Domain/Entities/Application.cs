namespace InternshipPlatform.Domain.Entities;

public enum ApplicationStatus
{
    Pending,
    UnderReview,
    Accepted,
    Rejected
}

public class Application
{
    public Guid Id { get; set; }

    public Guid OpportunityId { get; set; }
    public Opportunity Opportunity { get; set; } = null!;

    public Guid StudentId { get; set; }
    public User Student { get; set; } = null!;

    // Personal info snapshot at time of application
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PhoneCountryCode { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;

    // Education
    public string EducationLevel { get; set; } = string.Empty;
    public string FieldOfStudy { get; set; } = string.Empty;
    public string ExpectedGraduation { get; set; } = string.Empty;
    public string Availability { get; set; } = string.Empty;
    public string Motivation { get; set; } = string.Empty;

    // Documents (stored file paths / URLs)
    public string ResumePath { get; set; } = string.Empty;
    public string? CoverLetterPath { get; set; }
    public List<string> AdditionalFilePaths { get; set; } = [];

    public ApplicationStatus Status { get; set; } = ApplicationStatus.Pending;

    // Mentor review
    public string? ReviewFeedback { get; set; }
    public DateTime? ReviewedAt { get; set; }

    public DateTime AppliedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
