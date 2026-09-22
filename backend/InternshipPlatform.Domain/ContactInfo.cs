namespace InternshipPlatform.Domain;

/// <summary>
/// Contact details shown on a user's profile card. Owned by <see cref="User"/>.
/// </summary>
public class ContactInfo
{
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public string Availability { get; set; } = string.Empty;
    public PreferredChannel PreferredChannel { get; set; } = PreferredChannel.Chat;
}
