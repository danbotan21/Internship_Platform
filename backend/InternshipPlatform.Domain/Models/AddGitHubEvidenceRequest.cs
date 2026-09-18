using System.ComponentModel.DataAnnotations;

namespace InternshipPlatform.Domain.Models;

// A commit or pull request URL of an allowed team repository.
public sealed class AddGitHubEvidenceRequest
{
    [Required]
    [MaxLength(500)]
    public string Url { get; set; } = string.Empty;
}
