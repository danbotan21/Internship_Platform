using System.ComponentModel.DataAnnotations;

namespace InternshipPlatform.Domain.Models;

public sealed class AddContributionLinkRequest
{
    [Required]
    [MaxLength(200)]
    public string Name { get; set; } = string.Empty;

    [Required]
    [MaxLength(2048)]
    public string Url { get; set; } = string.Empty;

    [Required]
    [MaxLength(500)]
    public string Caption { get; set; } = string.Empty;
}
