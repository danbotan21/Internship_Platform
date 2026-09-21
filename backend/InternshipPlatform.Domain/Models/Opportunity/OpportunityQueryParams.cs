namespace InternshipPlatform.Domain.Models.Opportunity;

public class OpportunityQueryParams
{
    public string? Search { get; set; }
    public string? Status { get; set; }
    public string? Field { get; set; }
    public string? Type { get; set; }
    public string? LocationType { get; set; }
    public string? DurationCategory { get; set; }
    public int Page { get; set; } = 1;
    public int Limit { get; set; } = 10;
}
