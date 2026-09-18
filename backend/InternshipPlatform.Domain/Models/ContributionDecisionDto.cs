using InternshipPlatform.Domain.Entities;

namespace InternshipPlatform.Domain.Models;

public sealed class ContributionDecisionDto
{
    public Guid Id { get; set; }

    public Guid MentorId { get; set; }

    public ContributionDecisionType Decision { get; set; }

    public string? Reason { get; set; }

    public string? Note { get; set; }

    public DateTimeOffset DecidedAtUtc { get; set; }
}
