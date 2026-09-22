namespace InternshipPlatform.Domain.Entities;

public class Contribution
{
    public Guid Id { get; set; }

    // Resolved against the real Users table by Contribution Management.
    // Kept scalar to preserve module ownership and avoid exposing User graphs.
    public Guid StudentId { get; set; }

    public ContributionStatus Status { get; set; } = ContributionStatus.Draft;

    public int CurrentRevisionNumber { get; set; } = 1;

    public DateTimeOffset CreatedAtUtc { get; set; }

    public DateTimeOffset UpdatedAtUtc { get; set; }

    public DateTimeOffset? SubmittedAtUtc { get; set; }

    public ICollection<ContributionRevision> Revisions { get; set; } =
        new List<ContributionRevision>();

    public ICollection<ContributionCollaborator> Collaborators { get; set; } =
        new List<ContributionCollaborator>();
}
