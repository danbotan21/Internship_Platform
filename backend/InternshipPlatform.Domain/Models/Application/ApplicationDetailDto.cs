namespace InternshipPlatform.Domain.Models.Application;

public class ApplicationDetailDto
{
    public Guid Id { get; set; }
    public Guid OpportunityId { get; set; }
    public string OpportunityTitle { get; set; } = string.Empty;
    public string Company { get; set; } = string.Empty;

    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PhoneCountryCode { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public string EducationLevel { get; set; } = string.Empty;
    public string FieldOfStudy { get; set; } = string.Empty;
    public string ExpectedGraduation { get; set; } = string.Empty;
    public string Availability { get; set; } = string.Empty;
    public string Motivation { get; set; } = string.Empty;

    public string ResumePath { get; set; } = string.Empty;
    public string? CoverLetterPath { get; set; }
    public List<string> AdditionalFilePaths { get; set; } = [];

    public string Status { get; set; } = string.Empty;
    public string? ReviewFeedback { get; set; }
    public DateTime? ReviewedAt { get; set; }
    public DateTime AppliedAt { get; set; }
}
