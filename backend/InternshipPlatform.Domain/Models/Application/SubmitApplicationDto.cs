namespace InternshipPlatform.Domain.Models.Application;

public class SubmitApplicationDto
{
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

    // Files are received via IFormFile in the controller, not here
}
