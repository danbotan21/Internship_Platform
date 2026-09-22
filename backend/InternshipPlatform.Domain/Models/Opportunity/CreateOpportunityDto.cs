using System.ComponentModel.DataAnnotations;
using InternshipPlatform.Domain.Entities;

namespace InternshipPlatform.Domain.Models.Opportunity;

public class CreateOpportunityDto
{
    [Required]
    public string Title { get; set; } = string.Empty;

    [Required]
    public string Description { get; set; } = string.Empty;

    [Required]
    public string Location { get; set; } = string.Empty;

    [Required]
    public LocationType LocationType { get; set; }

    [Required]
    public OpportunityType Type { get; set; }

    [Required]
    public string Field { get; set; } = string.Empty;

    [Required]
    public string DurationCategory { get; set; } = string.Empty;

    public string Company { get; set; } = string.Empty;
    public string? CompanyLogo { get; set; }
    public string? LogoBg { get; set; }
    public string? LogoType { get; set; }

    public string AboutCompany { get; set; } = string.Empty;
    public string AboutInternship { get; set; } = string.Empty;
    public List<string> Responsibilities { get; set; } = [];
    public List<string> Requirements { get; set; } = [];
    public List<string> Technologies { get; set; } = [];

    [Required]
    public DateTime Deadline { get; set; }

    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }

    public OpportunityStatus? Status { get; set; }
}
