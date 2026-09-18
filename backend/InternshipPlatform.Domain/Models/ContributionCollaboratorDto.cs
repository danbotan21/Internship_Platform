using InternshipPlatform.Domain.Entities;

namespace InternshipPlatform.Domain.Models;

public sealed class ContributionCollaboratorDto
{
    public Guid Id { get; set; }

    public Guid UserId { get; set; }

    public string Name { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public string? GitHubUsername { get; set; }

    public ContributionCategory Area { get; set; }

    public string RoleDescription { get; set; } = string.Empty;

    public ContributionCollaboratorStatus Status { get; set; }

    public string? DisputeReason { get; set; }

    public string? ResolutionNote { get; set; }

    public DateTimeOffset AddedAtUtc { get; set; }

    public DateTimeOffset UpdatedAtUtc { get; set; }

    public DateTimeOffset? ConfirmedAtUtc { get; set; }

    public DateTimeOffset? DisputedAtUtc { get; set; }
}
