namespace InternshipPlatform.Domain.Entities;

public class Resource
{
    public Guid Id { get; set; }
    public Guid CreatedByUserId { get; set; }
    public string? TargetGroup { get; set; }
    public string Slug { get; set; } = string.Empty;
    public string Type { get; set; } = "Guide";
    public string Format { get; set; } = "Article";
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Owner { get; set; } = "Programme team";
    public string ContentHtml { get; set; } = string.Empty;
    public string Category { get; set; } = "Guides and learning";
    public string MentorName { get; set; } = string.Empty;
    public string[] Tags { get; set; } = Array.Empty<string>();
    public bool IsDraft { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<ResourceFavorite> Favorites { get; set; } = new List<ResourceFavorite>();
}