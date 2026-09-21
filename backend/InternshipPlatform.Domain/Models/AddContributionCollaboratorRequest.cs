using InternshipPlatform.Domain.Entities;
using System.ComponentModel.DataAnnotations;

namespace InternshipPlatform.Domain.Models;

public sealed class AddContributionCollaboratorRequest
{
    public Guid UserId { get; set; }

    public ContributionCategory Area { get; set; } = ContributionCategory.Development;

    [MaxLength(300)]
    public string RoleDescription { get; set; } = string.Empty;
}
