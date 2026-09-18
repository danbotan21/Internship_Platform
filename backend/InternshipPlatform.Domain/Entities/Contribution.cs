namespace InternshipPlatform.Domain.Entities;

public class Contribution
{
    public Guid Id { get; set; }

    // Scalar only until the User entity is supplied by its owning module.
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
