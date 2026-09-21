using System.ComponentModel.DataAnnotations;
using InternshipPlatform.Domain.Entities;

namespace InternshipPlatform.Domain.Models.Opportunity;

public class PatchOpportunityStatusDto
{
    [Required]
    public OpportunityStatus Status { get; set; }
}
