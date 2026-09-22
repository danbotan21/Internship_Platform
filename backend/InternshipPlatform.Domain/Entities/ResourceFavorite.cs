namespace InternshipPlatform.Domain.Entities;

public class ResourceFavorite
{
    public Guid ResourceId { get; set; }
    public Resource Resource { get; set; } = null!;
    public Guid UserId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}