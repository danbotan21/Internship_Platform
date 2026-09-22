namespace InternshipPlatform.Domain;

public class Milestone
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public DateOnly DueDate { get; set; }
    public int Order { get; set; }
    public bool RequiresReview { get; set; }
    public MilestoneStatus Status { get; set; } = MilestoneStatus.Pending;
    public DateTime? CompletedAt { get; set; }

    public Guid StudentUserId { get; set; }
    public User StudentUser { get; set; } = null!;

    public Guid? ReviewedByUserId { get; set; }
    public User? ReviewedByUser { get; set; }
}
