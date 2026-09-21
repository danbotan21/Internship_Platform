namespace InternshipPlatform.Domain;

public class TaskLogEntry
{
    public Guid Id { get; set; }
    public string Description { get; set; } = string.Empty;
    public decimal Hours { get; set; }
    public DateOnly Date { get; set; }
    public DateTime CreatedAt { get; set; }

    public Guid StudentUserId { get; set; }
    public User StudentUser { get; set; } = null!;
}
