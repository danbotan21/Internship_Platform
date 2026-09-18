using InternshipPlatform.Domain.Entities;
using System.ComponentModel.DataAnnotations;

namespace InternshipPlatform.Domain.Models;

public sealed class UpdateContributionCollaboratorRequest
{
    public ContributionCategory Area { get; set; } = ContributionCategory.Development;

    [MaxLength(300)]
    public string RoleDescription { get; set; } = string.Empty;

    // Required when answering a dispute.
    [MaxLength(1000)]
    public string? ResolutionNote { get; set; }
}
