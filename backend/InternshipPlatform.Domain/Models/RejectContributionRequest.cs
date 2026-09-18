using System.ComponentModel.DataAnnotations;

namespace InternshipPlatform.Domain.Models;

public sealed class RejectContributionRequest
{
    [Required]
    [MaxLength(200)]
    public string Reason { get; set; } = string.Empty;

    [Required]
    [MaxLength(2000)]
    public string Feedback { get; set; } = string.Empty;
}
