using System.ComponentModel.DataAnnotations;

namespace InternshipPlatform.Domain.Models;

public sealed class SubmitContributionRequest
{
    [MaxLength(1000)]
    public string? RevisionNote { get; set; }
}
