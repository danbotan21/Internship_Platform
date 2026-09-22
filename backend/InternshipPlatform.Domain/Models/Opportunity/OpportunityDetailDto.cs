namespace InternshipPlatform.Domain.Models.Opportunity;

public class OpportunityDetailDto
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
    public List<string> Tags { get; set; } = [];
    public string AboutCompany { get; set; } = string.Empty;
    public string AboutInternship { get; set; } = string.Empty;
    public List<string> Responsibilities { get; set; } = [];
    public List<string> Requirements { get; set; } = [];
    public List<string> Technologies { get; set; } = [];
    public DateTime Deadline { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public DateTime CreatedAt { get; set; }
    public bool IsSaved { get; set; }
    public bool HasApplied { get; set; }
    public string Status { get; set; } = string.Empty;
    public int ApplicationsCount { get; set; }
}
