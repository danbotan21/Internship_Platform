using InternshipPlatform.Domain.Entities;


namespace InternshipPlatform.Domain.Models;

public class OpportunityQueryDto
{
    public string? Search { get; set; }

    public OpportunityStatus? Status { get; set; }

    public string? Field { get; set; }

    public OpportunityType? Type { get; set; }

    public LocationType? LocationType { get; set; }

    public string? DurationCategory { get; set; }

    public int Page { get; set; } = 1;

    public int Limit { get; set; } = 10;
}
