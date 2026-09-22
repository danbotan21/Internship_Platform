namespace InternshipPlatform.Domain.Models.Application;

public class ReviewApplicationDto
{
    public string Status { get; set; } = string.Empty; // "Accepted" | "UnderReview" | "Rejected"
    public string? Feedback { get; set; }
}
