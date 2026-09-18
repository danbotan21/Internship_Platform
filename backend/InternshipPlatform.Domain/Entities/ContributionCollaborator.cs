namespace InternshipPlatform.Domain.Entities;

public class ContributionCollaborator
{
    public Guid Id { get; set; }

    public Guid ContributionId { get; set; }

    // Scalar identity until the User/identity module is supplied by the team.
    public string Name { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    // Stored separately so the database can enforce case-insensitive uniqueness.
    public string NormalizedEmail { get; set; } = string.Empty;

    public string Role { get; set; } = string.Empty;

    public ContributionCollaboratorStatus Status { get; set; } =
        ContributionCollaboratorStatus.PendingConfirmation;

    public string? DisputeReason { get; set; }

    public string? ResolutionNote { get; set; }

    public DateTimeOffset AddedAtUtc { get; set; }

    public DateTimeOffset UpdatedAtUtc { get; set; }

    public DateTimeOffset? ConfirmedAtUtc { get; set; }

    public DateTimeOffset? DisputedAtUtc { get; set; }

    public DateTimeOffset? ResolvedAtUtc { get; set; }

    public Contribution Contribution { get; set; } = null!;
}
