namespace InternshipPlatform.Domain.Models;

public sealed class ContributionReviewDto
{
    public Guid Id { get; set; }

    public Guid MentorId { get; set; }

    public string Feedback { get; set; } = string.Empty;

    public DateTimeOffset ChangesRequestedAtUtc { get; set; }
}
