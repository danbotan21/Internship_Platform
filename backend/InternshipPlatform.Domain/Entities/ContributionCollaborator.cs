namespace InternshipPlatform.Domain.Entities;

public class ContributionCollaborator
{
    public Guid Id { get; set; }

    public Guid ContributionId { get; set; }

    // Team member chosen from the real internship directory. The id remains
    // scalar so the Contribution module does not expose User navigation graphs.
    public Guid UserId { get; set; }

    // Snapshot of the member's name and email when they were added.
    public string Name { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public ContributionCategory Area { get; set; } = ContributionCategory.Development;

    public string RoleDescription { get; set; } = string.Empty;

    public ContributionCollaboratorStatus Status { get; set; } =
        ContributionCollaboratorStatus.PendingConfirmation;

    public string? DisputeReason { get; set; }

    // The author's answer to the latest dispute.
    public string? ResolutionNote { get; set; }

    public DateTimeOffset AddedAtUtc { get; set; }

    public DateTimeOffset UpdatedAtUtc { get; set; }

    public DateTimeOffset? ConfirmedAtUtc { get; set; }

    public DateTimeOffset? DisputedAtUtc { get; set; }

    public DateTimeOffset? ResolvedAtUtc { get; set; }

    public Contribution Contribution { get; set; } = null!;
}
