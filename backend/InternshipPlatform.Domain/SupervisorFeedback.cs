namespace InternshipPlatform.Domain;

public class SupervisorFeedback
{
    public Guid Id { get; set; }
    public int Punctuality { get; set; }
    public int Initiative { get; set; }
    public int SkillGrowth { get; set; }
    public string? Comments { get; set; }
    public DateTime CreatedAt { get; set; }

    public Guid StudentUserId { get; set; }
    public User StudentUser { get; set; } = null!;

    public Guid SupervisorUserId { get; set; }
    public User SupervisorUser { get; set; } = null!;
}
