using InternshipPlatform.Domain.Entities;

namespace InternshipPlatform.Domain.Models.Application;

public class ApplicationListItemDto
{
    public Guid Id { get; set; }
    public Guid OpportunityId { get; set; }
    public string OpportunityTitle { get; set; } = string.Empty;
    public string Company { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateTime AppliedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
