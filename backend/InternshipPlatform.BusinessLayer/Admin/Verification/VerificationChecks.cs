namespace InternshipPlatform.BusinessLayer.Admin.Verification;

/// <summary>
/// Cheap automatic checks shown to the admin. They support the decision, they never make it.
/// </summary>
public static class VerificationChecks
{
    // Moldovan IDNO: 13 digits.
    private const int IdnoLength = 13;

    public static bool EmailDomainMatchesWebsite(string email, string website)
    {
        var at = email.LastIndexOf('@');
        if (at < 0 || at == email.Length - 1)
        {
            return false;
        }

        var emailDomain = email[(at + 1)..].Trim().ToLowerInvariant();

        var candidate = website.Contains("://", StringComparison.Ordinal) ? website : $"https://{website}";
        if (!Uri.TryCreate(candidate, UriKind.Absolute, out var uri))
        {
            return false;
        }

        var host = uri.Host.ToLowerInvariant();
        if (host.StartsWith("www.", StringComparison.Ordinal))
        {
            host = host[4..];
        }

        return emailDomain == host || emailDomain.EndsWith($".{host}", StringComparison.Ordinal);
    }

    public static bool RegistrationNumberFormatValid(string registrationNumber)
    {
        var value = registrationNumber.Trim();
        if (value.StartsWith("IDNO", StringComparison.OrdinalIgnoreCase))
        {
            value = value[4..].Trim();
        }

        return value.Length == IdnoLength && value.All(char.IsAsciiDigit);
    }
}
