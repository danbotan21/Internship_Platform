namespace InternshipPlatform.Domain.Models;

public sealed class AddContributionCollaboratorRequest
{
    public string Name { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public string Role { get; set; } = string.Empty;
}
