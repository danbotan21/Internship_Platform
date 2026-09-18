using System.ComponentModel.DataAnnotations;

namespace InternshipPlatform.Domain.Models;

public sealed class ValidateContributionRequest
{
    [MaxLength(2000)]
    public string? Note { get; set; }
}
