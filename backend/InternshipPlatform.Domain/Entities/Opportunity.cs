namespace InternshipPlatform.Domain.Entities;

public enum OpportunityType
{
    FullTime,
    PartTime
}

public enum LocationType
{
    OnSite,
    Hybrid,
    Remote
}

public enum OpportunityStatus
{
    Draft,
    Open,
    Closed
}

public class Opportunity
{
    public Guid Id { get; set; }

    public string Title { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public string Location { get; set; } = string.Empty;

    public LocationType LocationType { get; set; }

    public OpportunityType Type { get; set; }

    public string Field { get; set; } = string.Empty;

    public string DurationCategory { get; set; } = string.Empty;

    public OpportunityStatus Status { get; set; } = OpportunityStatus.Draft;

    public DateTime StartDate { get; set; }

    public DateTime EndDate { get; set; }

    public DateTime Deadline { get; set; }

    public string Company { get; set; } = string.Empty;

    public string? CompanyLogo { get; set; }

    public string? LogoBg { get; set; }

    public string? LogoType { get; set; }

    // Rich detail fields
    public string AboutCompany { get; set; } = string.Empty;

    public string AboutInternship { get; set; } = string.Empty;

    // Stored as JSON arrays in the DB column
    public List<string> Responsibilities { get; set; } = [];

    public List<string> Requirements { get; set; } = [];

    public List<string> Technologies { get; set; } = [];

    public List<string> Tags { get; set; } = [];

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }

    public Guid MentorId { get; set; }

    // Navigation properties
    public User Mentor { get; set; } = null!;

    public List<Application> Applications { get; set; } = [];
}