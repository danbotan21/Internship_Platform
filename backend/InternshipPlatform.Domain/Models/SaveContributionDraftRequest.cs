using InternshipPlatform.Domain.Entities;
using System.ComponentModel.DataAnnotations;

namespace InternshipPlatform.Domain.Models;

public sealed class SaveContributionDraftRequest
{
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    public ContributionCategory Category { get; set; } =
        ContributionCategory.Development;

    [MaxLength(100)]
    public string WorkPeriod { get; set; } = string.Empty;

    [MaxLength(4000)]
    public string Description { get; set; } = string.Empty;

    [MaxLength(500)]
    public string OwnRole { get; set; } = string.Empty;

    [MaxLength(100)]
    public string? LinkedTaskReference { get; set; }

    [MaxLength(1000)]
    public string? EvidenceNote { get; set; }

    [MaxLength(1000)]
    public string? RevisionNote { get; set; }
}
