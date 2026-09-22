namespace InternshipPlatform.Domain.Models.Opportunity;

public class OpportunityListItemDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Company { get; set; } = string.Empty;
    public string? CompanyLogo { get; set; }
    public string? LogoBg { get; set; }
    public string? LogoType { get; set; }
    public string Location { get; set; } = string.Empty;
    public string LocationType { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public string DurationCategory { get; set; } = string.Empty;
    public string Field { get; set; } = string.Empty;
    public List<string> Technologies { get; set; } = [];
    public List<string> Tags { get; set; } = [];
    public DateTime Deadline { get; set; }
    public DateTime CreatedAt { get; set; }
    public bool IsSaved { get; set; }
    public string Status { get; set; } = string.Empty;
    public int ApplicationsCount { get; set; }
}
