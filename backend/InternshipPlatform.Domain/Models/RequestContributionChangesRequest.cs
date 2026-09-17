using System.ComponentModel.DataAnnotations;

namespace InternshipPlatform.Domain.Models;

public sealed class RequestContributionChangesRequest
{
    [Required]
    [MaxLength(2000)]
    public string Feedback { get; set; } = string.Empty;
}
